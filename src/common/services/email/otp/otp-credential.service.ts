import { createHmac, randomInt, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HashService } from '@/common/modules/security/services/hash.service';
import { ConfigConsts } from '@/shared/constants/config';
import type { EmailOtpPurposeEnum } from '@/shared/enums/auth';

/** Generates and Argon2id-hashes email OTP credentials without retaining plaintext. */
@Injectable()
export class OtpCredentialService {
  constructor(
    private readonly configService: ConfigService,
    private readonly hashes: HashService,
  ) {}

  /** Creates a cryptographically random six-digit code and an opaque challenge ID. */
  public createChallenge(): { challengeId: string; code: string } {
    return {
      challengeId: randomUUID(),
      code: randomInt(0, 1_000_000).toString().padStart(6, '0'),
    };
  }

  /** Hashes a purpose- and recipient-bound OTP with Argon2id and a server-side HMAC key. */
  public async hash(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    code: string,
  ): Promise<string> {
    return this.hashes.hash(this.keyedDigest(purpose, subject, code));
  }

  /** Checks a submitted OTP against its stored Argon2id digest. */
  public async verify(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    code: string,
    digest: string,
  ): Promise<boolean> {
    return this.hashes.verify(digest, this.keyedDigest(purpose, subject, code));
  }

  /** Produces an opaque Redis key component without exposing an email address. */
  public subjectKey(subject: string): string {
    return this.keyedDigest(subject.trim().toLowerCase());
  }

  /**
   * Computes a keyed HMAC-SHA256 digest binding the supplied parts together.
   *
   * @param parts Values to bind, in order, joined with a colon separator.
   * @returns Hex-encoded digest.
   */
  private keyedDigest(...parts: string[]): string {
    return createHmac('sha256', this.hashSecret())
      .update(parts.join(':'))
      .digest('hex');
  }

  /**
   * Reads the server-side HMAC key shared by every OTP digest.
   *
   * @returns The configured OTP hash secret.
   */
  private hashSecret(): string {
    return this.configService.getOrThrow<string>(
      ConfigConsts.email.otpHashSecret,
    );
  }
}
