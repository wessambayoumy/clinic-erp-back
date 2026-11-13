import { createHmac, randomInt, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { ConfigConsts } from '@/config/config.consts';
import type { EmailOtpPurposeEnum } from '@/shared/enums/auth';

/** Generates and bcrypt-hashes email OTP credentials without retaining plaintext. */
@Injectable()
export class OtpCredentialService {
  constructor(private readonly configService: ConfigService) {}

  /** Creates a cryptographically random six-digit code and an opaque challenge ID. */
  public createChallenge(): { challengeId: string; code: string } {
    return {
      challengeId: randomUUID(),
      code: randomInt(0, 1_000_000).toString().padStart(6, '0'),
    };
  }

  /** Hashes a purpose- and recipient-bound OTP with bcrypt and a server-side HMAC key. */
  public async hash(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    code: string,
  ): Promise<string> {
    const digest = this.keyedDigest(purpose, subject, code);
    const rounds = this.configService.getOrThrow<number>(
      ConfigConsts.email.bcryptRounds,
    );

    return bcrypt.hash(digest, rounds);
  }

  /** Checks a submitted OTP against its stored bcrypt hash. */
  public async verify(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    code: string,
    digest: string,
  ): Promise<boolean> {
    return bcrypt.compare(this.keyedDigest(purpose, subject, code), digest);
  }

  /** Produces an opaque Redis key component without exposing an email address. */
  public subjectKey(subject: string): string {
    return createHmac(
      'sha256',
      this.configService.getOrThrow<string>(ConfigConsts.email.otpHashSecret),
    )
      .update(subject.trim().toLowerCase())
      .digest('hex');
  }

  private keyedDigest(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    code: string,
  ): string {
    return createHmac(
      'sha256',
      this.configService.getOrThrow<string>(ConfigConsts.email.otpHashSecret),
    )
      .update(`${purpose}:${subject.trim().toLowerCase()}:${code}`)
      .digest('hex');
  }
}
