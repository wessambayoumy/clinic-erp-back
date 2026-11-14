import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RedisClientType } from 'redis';

import { ConfigConsts } from '@/shared/constants/config';
import { RedisService } from '@/core/redis/redis.service';
import type { EmailOtpPurposeEnum } from '@/shared/enums/auth';
import { OtpCacheOutcomeEnum } from '@/shared/enums/email';
import { OtpCredentialService } from './otp-credential.service';

/** Lifetime of a stored OTP digest and its attempt counter, in seconds. */
export const OTP_TTL_SECONDS = 300;

const BEGIN_VERIFY_SCRIPT = `
local digest = redis.call('GET', KEYS[1])
if not digest then return 0 end
local attempts = redis.call('INCR', KEYS[2])
if attempts == 1 then redis.call('EXPIRE', KEYS[2], ARGV[1]) end
if attempts > tonumber(ARGV[2]) then return -1 end
return digest
`;

const CONSUME_SCRIPT = `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
redis.call('DEL', KEYS[1], KEYS[2])
return 1
`;

const RATE_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
if count > tonumber(ARGV[2]) then return 0 end
return 1
`;

/** Stores only Argon2id digests for OTPs in Redis and consumes them atomically. */
@Injectable()
export class OtpCacheService {
  constructor(
    private readonly redis: RedisService,
    private readonly credentials: OtpCredentialService,
    private readonly configService: ConfigService,
  ) {}

  /** Stores an OTP digest and attempt counter with the fixed five-minute TTL. */
  public async issue(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    challengeId: string,
    digest: string,
  ): Promise<void> {
    const client = this.requireClient();
    const [otpKey, attemptsKey] = this.keys(purpose, subject, challengeId);

    await client
      .multi()
      .set(otpKey, digest, { expiration: { type: 'EX', value: OTP_TTL_SECONDS } })
      .set(attemptsKey, '0', {
        expiration: { type: 'EX', value: OTP_TTL_SECONDS },
      })
      .exec();
  }

  /** Allows at most the configured number of email requests per recipient and purpose. */
  public async allowRequest(
    purpose: EmailOtpPurposeEnum,
    subject: string,
  ): Promise<boolean> {
    const client = this.requireClient();
    const key = `email:limit:${purpose}:subject:${this.credentials.subjectKey(subject)}`;
    const limit = this.configService.getOrThrow<number>(
      ConfigConsts.email.requestLimitPerHour,
    );
    const result = await client.eval(RATE_LIMIT_SCRIPT, {
      keys: [key],
      arguments: ['3600', String(limit)],
    });

    return Number(result) === 1;
  }

  /** Verifies, limits failed attempts, and consumes a matching code exactly once. */
  public async verify(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    challengeId: string,
    code: string,
  ): Promise<OtpCacheOutcomeEnum> {
    const client = this.requireClient();
    const [otpKey, attemptsKey] = this.keys(purpose, subject, challengeId);
    const maxAttempts = this.configService.getOrThrow<number>(
      ConfigConsts.email.codeMaxAttempts,
    );
    const storedDigest = await client.eval(BEGIN_VERIFY_SCRIPT, {
      keys: [otpKey, attemptsKey],
      arguments: [String(OTP_TTL_SECONDS), String(maxAttempts)],
    });

    if (storedDigest === 0) return OtpCacheOutcomeEnum.EXPIRED;
    if (storedDigest === -1) return OtpCacheOutcomeEnum.LOCKED;
    if (typeof storedDigest !== 'string') {
      throw new ServiceUnavailableException('OTP service is temporarily unavailable');
    }

    const matches = await this.credentials.verify(
      purpose,
      subject,
      code,
      storedDigest,
    );

    if (!matches) return OtpCacheOutcomeEnum.INVALID;

    const consumed = await client.eval(CONSUME_SCRIPT, {
      keys: [otpKey, attemptsKey],
      arguments: [storedDigest],
    });

    return Number(consumed) === 1
      ? OtpCacheOutcomeEnum.VERIFIED
      : OtpCacheOutcomeEnum.EXPIRED;
  }

  /** Removes a challenge when its email could not be delivered. */
  public async remove(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    challengeId: string,
  ): Promise<void> {
    const client = this.requireClient();
    await client.del(this.keys(purpose, subject, challengeId));
  }

  private keys(
    purpose: EmailOtpPurposeEnum,
    subject: string,
    challengeId: string,
  ): [string, string] {
    const subjectKey = this.credentials.subjectKey(subject);
    const challengeKey = `email:otp:${purpose}:${subjectKey}:${challengeId}`;

    return [challengeKey, `${challengeKey}:attempts`];
  }

  private requireClient(): RedisClientType {
    const client = this.redis.getClient();

    if (!client?.isReady) {
      throw new ServiceUnavailableException('OTP service is temporarily unavailable');
    }

    return client;
  }
}
