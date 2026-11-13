import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Mailer } from '@nestjs/mail';

import { OtpCacheOutcomeEnum } from '@/core/external/email/otp/otp-cache-outcome.enum';
import type { IOtpChallenge } from '@/core/external/email/otp/otp-challenge.interface';
import { OtpCacheService } from '@/core/external/email/otp/otp-cache.service';
import { OtpCredentialService } from '@/core/external/email/otp/otp-credential.service';
import type {
  ILoginNoticeMailData,
  IOtpMailData,
  IPasswordChangedMailData,
  IStaffInvitationMailData,
} from '@/core/external/email/interfaces';
import {
  AccountOtpMail,
  LoginNoticeMail,
  PasswordChangedMail,
  StaffInvitationMail,
} from '@/core/external/email/templates';
import { EmailOtpPurposeEnum } from '@/shared/enums/auth';

const OTP_TTL_SECONDS = 300;

/** Sends account emails and coordinates Redis-backed one-time codes. */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailer: Mailer,
    private readonly otpCredentials: OtpCredentialService,
    private readonly otpCache: OtpCacheService,
  ) {}

  /** Issues a five-minute OTP, stores only its bcrypt digest, and emails the code. */
  public async issueOtp(
    email: string,
    purpose: EmailOtpPurposeEnum,
    accountSubject: string = email,
  ): Promise<IOtpChallenge> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!(await this.otpCache.allowRequest(purpose, accountSubject))) {
      throw new HttpException(
        'Too many email code requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const challenge = this.otpCredentials.createChallenge();
    const digest = await this.otpCredentials.hash(
      purpose,
      accountSubject,
      challenge.code,
    );

    await this.otpCache.issue(
      purpose,
      accountSubject,
      challenge.challengeId,
      digest,
    );

    const mailData: IOtpMailData = {
      purpose,
      code: challenge.code,
      expiresInMinutes: OTP_TTL_SECONDS / 60,
    };

    try {
      await this.mailer.send(AccountOtpMail, {
        to: normalizedEmail,
        data: mailData,
      });
    } catch (error: unknown) {
      await this.otpCache.remove(
        purpose,
        accountSubject,
        challenge.challengeId,
      );
      this.logger.error(
        `Account email delivery failed (${error instanceof Error ? error.name : 'UnknownError'})`,
      );
      throw new ServiceUnavailableException(
        'Email delivery is temporarily unavailable. Please try again.',
      );
    }

    return {
      challengeId: challenge.challengeId,
      purpose,
      expiresInSeconds: OTP_TTL_SECONDS,
    };
  }

  /** Validates and consumes a code; wrong, expired, and locked codes never succeed. */
  public async verifyOtp(
    purpose: EmailOtpPurposeEnum,
    challengeId: string,
    code: string,
    accountSubject: string,
  ): Promise<OtpCacheOutcomeEnum> {
    return this.otpCache.verify(
      purpose,
      accountSubject,
      challengeId,
      code,
    );
  }

  /** Sends a non-critical security notice after a successful sign-in. */
  public async sendLoginNotice(email: string, signedInAt: Date): Promise<void> {
    const data: ILoginNoticeMailData = {
      signedInAt: signedInAt.toISOString(),
    };

    await this.mailer.send(LoginNoticeMail, { to: email, data });
  }

  /** Sends a security notice after a password update. */
  public async sendPasswordChangedNotice(
    email: string,
    changedAt: Date,
  ): Promise<void> {
    const data: IPasswordChangedMailData = {
      changedAt: changedAt.toISOString(),
    };

    await this.mailer.send(PasswordChangedMail, { to: email, data });
  }

  /** Sends a staff invitation to its intended recipient. */
  public async sendStaffInvitation(
    email: string,
    data: IStaffInvitationMailData,
  ): Promise<void> {
    await this.mailer.send(StaffInvitationMail, { to: email, data });
  }
}
