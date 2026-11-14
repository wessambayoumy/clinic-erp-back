import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Queue } from 'bullmq';

import { IdentityRepository } from '../identity/identity.repository';
import { RLSService } from '@/common/database/rls/rls.service';
import type { PrismaTransaction } from '@/shared/types';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { HashService } from '@/common/modules/security/services/hash.service';
import { EmailService } from '@/common/services/email';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { OtpCacheOutcomeEnum } from '@/shared/enums/email';
import {
  EmailJobNameEnum,
  EmailOtpPurposeEnum,
  EmailQueueEnum,
} from '@/shared/enums';
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dtos';
import type {
  IAuthAccount,
  IAuthChallengeResponse,
  IAuthSessionResponse,
  IMessageResponse,
} from '@/shared/interfaces/auth';
import type { IAccountEmailNoticeJob } from '@/shared/interfaces/email';

const OTP_EXPIRES_IN_SECONDS = 300;
const GENERIC_RESET_MESSAGE =
  'If the account exists, a password reset code has been sent.';

/** Coordinates tenant-scoped signup, email OTP login, and password recovery. */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rls: RLSService,
    private readonly identityRepository: IdentityRepository,
    private readonly passwords: HashService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly logger: LoggerService,
    @InjectQueue(EmailQueueEnum.ACCOUNT_NOTIFICATIONS)
    private readonly emailQueue: Queue<IAccountEmailNoticeJob>,
  ) {}

  /** Creates or resumes an unverified account, then sends its signup OTP. */
  public async register(input: RegisterDto): Promise<IAuthChallengeResponse> {
    const email = this.normalizeEmail(input.email);
    const existing = await this.findAccount(
      input.organizationId,
      input.locationId,
      email,
    );

    if (existing?.emailVerified) {
      throw new ConflictException('An account already uses this email address.');
    }

    if (!existing) {
      const password = await this.passwords.hash(input.password);
      await this.withTenant(input.organizationId, input.locationId, async (tx) => {
        await this.requireLocation(tx, input.organizationId, input.locationId);
        await this.identityRepository.createAccount(tx, {
          organizationId: input.organizationId,
          email,
          password,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
        });
      });
    }

    const challenge = await this.email.issueOtp(
      email,
      EmailOtpPurposeEnum.REGISTRATION,
      this.accountSubject(input.organizationId, email),
    );

    return this.createChallengeResponse(
      challenge,
      'Check your email for a verification code.',
    );
  }

  /** Verifies a signup code and activates the account email address. */
  public async verifyRegistration(
    input: VerifyOtpDto,
  ): Promise<IMessageResponse> {
    const email = this.normalizeEmail(input.email);
    const outcome = await this.email.verifyOtp(
      EmailOtpPurposeEnum.REGISTRATION,
      input.challengeId,
      input.code,
      this.accountSubject(input.organizationId, email),
    );
    this.requireSuccessfulOtp(outcome);

    const result = await this.withTenant(
      input.organizationId,
      input.locationId,
      async (tx) => {
        await this.requireLocation(tx, input.organizationId, input.locationId);
        const user = await this.identityRepository.findAccount(
          tx,
          input.organizationId,
          email,
        );
        const account = this.asAuthAccount(user);
        if (!account) throw new NotFoundException('Account not found.');

        return this.identityRepository.updateEmailVerified(
          tx,
          account.id,
          input.organizationId,
        );
      },
    );

    if (!result) throw new NotFoundException('Account not found.');
    return { message: 'Email address verified. You can now sign in.' };
  }

  /** Checks primary credentials and sends an OTP required for every sign-in. */
  public async login(input: LoginDto): Promise<IAuthChallengeResponse> {
    const email = this.normalizeEmail(input.email);
    const account = await this.findAccount(
      input.organizationId,
      input.locationId,
      email,
    );

    if (
      !account ||
      !account.isActive ||
      !account.emailVerified ||
      !(await this.passwords.verify(account.password, input.password))
    ) {
      throw new UnauthorizedException('Invalid sign-in credentials.');
    }

    const challenge = await this.email.issueOtp(
      email,
      EmailOtpPurposeEnum.LOGIN,
      this.accountSubject(input.organizationId, email),
    );

    return this.createChallengeResponse(
      challenge,
      'Check your email for a sign-in code.',
    );
  }

  /** Consumes the sign-in OTP and returns a JWT for the selected clinic location. */
  public async verifyLogin(input: VerifyOtpDto): Promise<IAuthSessionResponse> {
    const email = this.normalizeEmail(input.email);
    const outcome = await this.email.verifyOtp(
      EmailOtpPurposeEnum.LOGIN,
      input.challengeId,
      input.code,
      this.accountSubject(input.organizationId, email),
    );
    this.requireSuccessfulOtp(outcome);

    const account = await this.findAccount(
      input.organizationId,
      input.locationId,
      email,
    );
    if (!account || !account.isActive || !account.emailVerified) {
      throw new UnauthorizedException('Sign-in could not be completed.');
    }

    const expiresIn = this.config.getOrThrow<string>(
      'auth.jwt.accessExpiresIn',
    );
    const accessToken = await this.jwt.signAsync({
      sub: account.id,
      email: account.email,
      organizationId: input.organizationId,
      locationId: input.locationId,
      roles: [],
    });

    await this.enqueueNotice(
      EmailJobNameEnum.SIGN_IN_NOTICE,
      email,
      'sign-in',
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: account.id,
        email: account.email,
        organizationId: input.organizationId,
        locationId: input.locationId,
        emailVerified: true,
      },
    };
  }

  /** Sends a neutral response whether or not a matching account exists. */
  public async requestPasswordReset(
    input: ForgotPasswordDto,
  ): Promise<IAuthChallengeResponse> {
    const email = this.normalizeEmail(input.email);

    try {
      const account = await this.findAccount(
        input.organizationId,
        input.locationId,
        email,
      );

      if (account?.emailVerified && account.isActive) {
        const challenge = await this.email.issueOtp(
          email,
          EmailOtpPurposeEnum.PASSWORD_RESET,
          this.accountSubject(input.organizationId, email),
        );
        return this.createChallengeResponse(challenge, GENERIC_RESET_MESSAGE);
      }
    } catch (error: unknown) {
      this.logger.warn(
        `Password reset request could not be processed (${error instanceof Error ? error.name : 'UnknownError'})`,
      );
    }

    return {
      challengeId: randomUUID(),
      expiresInSeconds: OTP_EXPIRES_IN_SECONDS,
      message: GENERIC_RESET_MESSAGE,
    };
  }

  /** Changes a password only after the matching five-minute OTP is consumed. */
  public async resetPassword(
    input: ResetPasswordDto,
  ): Promise<IMessageResponse> {
    const email = this.normalizeEmail(input.email);
    const outcome = await this.email.verifyOtp(
      EmailOtpPurposeEnum.PASSWORD_RESET,
      input.challengeId,
      input.code,
      this.accountSubject(input.organizationId, email),
    );
    this.requireSuccessfulOtp(outcome);

    const password = await this.passwords.hash(input.newPassword);
    const updated = await this.withTenant(
      input.organizationId,
      input.locationId,
      async (tx) => {
        const user = await this.identityRepository.findAccount(
          tx,
          input.organizationId,
          email,
        );
        const account = this.asAuthAccount(user);
        if (!account?.emailVerified || !account.isActive) {
          throw new BadRequestException('Password reset could not be completed.');
        }

        return this.identityRepository.updatePassword(
          tx,
          account.id,
          input.organizationId,
          password,
        );
      },
    );

    if (!updated) {
      throw new BadRequestException('Password reset could not be completed.');
    }

    await this.enqueueNotice(
      EmailJobNameEnum.PASSWORD_CHANGED_NOTICE,
      email,
      'password-change',
    );
    return { message: 'Your password has been updated. You can now sign in.' };
  }

  /** Finds a tenant account and validates its selected location. */
  private async findAccount(
    organizationId: string,
    locationId: string,
    email: string,
  ): Promise<IAuthAccount | null> {
    const user = await this.withTenant(organizationId, locationId, async (tx) => {
      await this.requireLocation(tx, organizationId, locationId);
      return this.identityRepository.findAccount(tx, organizationId, email);
    });
    return this.asAuthAccount(user);
  }

  /** Requires an active location owned by the selected organization. */
  private async requireLocation(
    tx: PrismaTransaction,
    organizationId: string,
    locationId: string,
  ): Promise<void> {
    const location = await this.identityRepository.findLocation(
      tx,
      organizationId,
      locationId,
    );
    if (!this.isActiveLocation(location)) {
      throw new BadRequestException('The selected clinic location is unavailable.');
    }
  }

  /** Applies tenant RLS context to all database work in the transaction. */
  private async withTenant<T>(
    organizationId: string,
    locationId: string,
    operation: (tx: PrismaTransaction) => Promise<T>,
  ): Promise<T> {
    return this.prisma.client.transaction(async (tx) => {
      await this.rls.applyContext(tx, { organizationId, locationId });
      return operation(tx);
    });
  }

  /** Queues a non-critical account email and logs failures without blocking auth. */
  private async enqueueNotice(
    name: EmailJobNameEnum,
    email: string,
    event: string,
  ): Promise<void> {
    try {
      await this.emailQueue.add(
        name,
        { email, occurredAt: new Date().toISOString() },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: { age: 86_400 },
        },
      );
    } catch (error: unknown) {
      this.logger.warn(
        `Could not queue ${event} notice (${error instanceof Error ? error.name : 'UnknownError'})`,
      );
    }
  }

  /** Builds the public response returned after an OTP is sent. */
  private createChallengeResponse(
    challenge: { challengeId: string; expiresInSeconds: number },
    message: string,
  ): IAuthChallengeResponse {
    return {
      challengeId: challenge.challengeId,
      expiresInSeconds: challenge.expiresInSeconds,
      message,
    };
  }

  /** Converts OTP cache results into suitable HTTP errors. */
  private requireSuccessfulOtp(outcome: OtpCacheOutcomeEnum): void {
    switch (outcome) {
      case OtpCacheOutcomeEnum.VERIFIED:
        return;
      case OtpCacheOutcomeEnum.INVALID:
        throw new BadRequestException('The email code is not valid.');
      case OtpCacheOutcomeEnum.EXPIRED:
        throw new BadRequestException('The email code expired. Request a new code.');
      case OtpCacheOutcomeEnum.LOCKED:
        throw new HttpException(
          'Too many incorrect code attempts. Request a new code later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
    }
  }

  /** Produces a tenant-specific OTP subject without using raw email as its key. */
  private accountSubject(organizationId: string, email: string): string {
    return `${organizationId}:${email}`;
  }

  /** Normalizes account emails for consistent lookups and OTP binding. */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /** Checks whether a value represents an active clinic location. */
  private isActiveLocation(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      'isActive' in value &&
      value.isActive === true
    );
  }

  /** Narrows an ORM result to fields used by public authentication workflows. */
  private asAuthAccount(value: unknown): IAuthAccount | null {
    if (typeof value !== 'object' || value === null) return null;
    const account = value as Record<string, unknown>;

    if (
      typeof account['id'] !== 'string' ||
      typeof account['organizationId'] !== 'string' ||
      typeof account['email'] !== 'string' ||
      typeof account['password'] !== 'string' ||
      typeof account['emailVerified'] !== 'boolean' ||
      typeof account['isActive'] !== 'boolean'
    ) {
      return null;
    }

    return {
      id: account['id'],
      organizationId: account['organizationId'],
      email: account['email'],
      password: account['password'],
      emailVerified: account['emailVerified'],
      isActive: account['isActive'],
    };
  }
}
