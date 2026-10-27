import { createHash, timingSafeEqual } from 'node:crypto';

import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

import {
  DEFAULT_ARGON2_MEMORY_COST_KIB,
  DEFAULT_ARGON2_PARALLELISM,
  DEFAULT_ARGON2_TIME_COST,
  MIN_ARGON2_MEMORY_COST_KIB,
  MIN_ARGON2_PARALLELISM,
  MIN_ARGON2_TIME_COST,
  MIN_PEPPER_LENGTH,
} from '../constants';
import { SecurityConfigKeyEnum } from '../enums';
import type { IArgon2Config } from '../interfaces';

/**
 * Password and secret hashing based on Argon2id.
 *
 * Use `hash`/`verify` for human-chosen secrets (passwords, PINs).
 * Use `hashToken`/`verifyToken` for high-entropy random tokens (refresh tokens),
 * where a slow KDF adds cost without adding security and where a fast digest
 * allows indexed lookup.
 */
@Injectable()
export class HashService implements OnModuleInit {
  private readonly logger = new Logger(HashService.name);

  private argon2Config!: IArgon2Config;

  /**
   * @param configService Nest configuration accessor.
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Resolves and validates the Argon2id parameters at bootstrap so a bad
   * configuration fails fast instead of at the first login.
   */
  onModuleInit(): void {
    this.argon2Config = {
      memoryCost: this.readInteger(
        SecurityConfigKeyEnum.ARGON2_MEMORY_COST,
        DEFAULT_ARGON2_MEMORY_COST_KIB,
        MIN_ARGON2_MEMORY_COST_KIB,
      ),
      timeCost: this.readInteger(
        SecurityConfigKeyEnum.ARGON2_TIME_COST,
        DEFAULT_ARGON2_TIME_COST,
        MIN_ARGON2_TIME_COST,
      ),
      parallelism: this.readInteger(
        SecurityConfigKeyEnum.ARGON2_PARALLELISM,
        DEFAULT_ARGON2_PARALLELISM,
        MIN_ARGON2_PARALLELISM,
      ),
      pepper: this.readPepper(),
    };
  }

  /**
   * Hashes a plaintext secret with Argon2id and a random per-hash salt.
   *
   * @param plain Plaintext secret.
   * @returns PHC-formatted digest (parameters and salt are embedded).
   */
  async hash(plain: string): Promise<string> {
    const { memoryCost, timeCost, parallelism, pepper } = this.argon2Config;

    return argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost,
      timeCost,
      parallelism,
      ...(pepper ? { secret: pepper } : {}),
    });
  }

  /**
   * Verifies a plaintext secret against a stored digest.
   * Malformed digests are treated as a failed match, never as an exception.
   *
   * @param digest Stored PHC-formatted digest.
   * @param plain Plaintext secret supplied by the caller.
   * @returns True when the secret matches.
   */
  async verify(digest: string, plain: string): Promise<boolean> {
    const { pepper } = this.argon2Config;

    try {
      return await argon2.verify(digest, plain, pepper ? { secret: pepper } : undefined);
    } catch (error: unknown) {
      this.logger.warn(
        `Argon2 verification failed to run: ${error instanceof Error ? error.name : 'UnknownError'}`,
      );
      return false;
    }
  }

  /**
   * Tells whether a stored digest was produced with weaker parameters than the
   * current configuration. Call it after a successful `verify` and re-hash the
   * plaintext on the spot to upgrade users transparently.
   *
   * @param digest Stored PHC-formatted digest.
   * @returns True when the digest should be regenerated.
   */
  needsRehash(digest: string): boolean {
    const { memoryCost, timeCost, parallelism } = this.argon2Config;

    return argon2.needsRehash(digest, {
      type: argon2.argon2id,
      memoryCost,
      timeCost,
      parallelism,
    });
  }

  /**
   * Produces a deterministic SHA-256 digest of a high-entropy token.
   * Only suitable for random tokens, never for passwords.
   *
   * @param token Random token (for example a refresh token).
   * @returns Hex-encoded digest safe to store and index.
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Compares a token with a stored digest in constant time.
   *
   * @param token Token supplied by the caller.
   * @param digest Stored hex digest from `hashToken`.
   * @returns True when the token matches.
   */
  verifyToken(token: string, digest: string): boolean {
    const expected = Buffer.from(this.hashToken(token), 'hex');
    const actual = Buffer.from(digest, 'hex');

    return actual.length === expected.length && timingSafeEqual(expected, actual);
  }

  /**
   * Reads a positive integer setting, falling back to a default.
   *
   * @param key Environment key.
   * @param fallback Value used when the key is unset.
   * @param minimum Smallest accepted value.
   * @returns The validated integer.
   */
  private readInteger(key: SecurityConfigKeyEnum, fallback: number, minimum: number): number {
    const raw = this.configService.get<string | number>(key);
    const value = raw === undefined || raw === '' ? fallback : Number(raw);

    if (!Number.isInteger(value) || value < minimum) {
      throw new Error(`${key} must be an integer greater than or equal to ${String(minimum)}`);
    }

    return value;
  }

  /**
   * Reads the optional pepper. Rotating it invalidates every stored hash,
   * so treat it as a long-lived secret.
   *
   * @returns Pepper bytes, or null when no pepper is configured.
   */
  private readPepper(): Buffer | null {
    const raw = this.configService.get<string>(SecurityConfigKeyEnum.HASH_PEPPER);

    if (raw === undefined || raw === '') {
      this.logger.warn(`${SecurityConfigKeyEnum.HASH_PEPPER} is not set; hashing without a pepper`);
      return null;
    }

    if (raw.length < MIN_PEPPER_LENGTH) {
      throw new Error(
        `${SecurityConfigKeyEnum.HASH_PEPPER} must be at least ${String(MIN_PEPPER_LENGTH)} characters`,
      );
    }

    return Buffer.from(raw, 'utf8');
  }
}
