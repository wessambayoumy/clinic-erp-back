import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from 'node:crypto';

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ENCRYPTION_ALGORITHM,
  ENCRYPTION_AUTH_TAG_LENGTH_BYTES,
  ENCRYPTION_HKDF_INFO_PREFIX,
  ENCRYPTION_IV_LENGTH_BYTES,
  ENCRYPTION_KEY_LENGTH_BYTES,
  ENCRYPTION_PAYLOAD_SEGMENT_COUNT,
  ENCRYPTION_PAYLOAD_SEPARATOR,
  ENCRYPTION_PAYLOAD_VERSION,
} from '../constants';
import { SecurityConfigKeyEnum } from '../enums';
import type { IEncryptedPayload } from '../interfaces';

/**
 * Field-level encryption using AES-256-GCM.
 *
 * Every call derives a dedicated key from the master key with HKDF-SHA256 using a
 * caller-supplied context (use the `organizationId`), and binds the ciphertext to
 * that context as additional authenticated data. A payload encrypted for one
 * tenant therefore cannot be decrypted, or swapped in, under another.
 *
 * Payload format: `v1.<iv>.<tag>.<ciphertext>`, each segment base64url.
 */
@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly logger = new Logger(EncryptionService.name);

  private masterKey!: Buffer;

  /**
   * @param configService Nest configuration accessor.
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Loads and validates the master key at bootstrap.
   */
  onModuleInit(): void {
    const encoded = this.configService.get<string>(
      SecurityConfigKeyEnum.ENCRYPTION_MASTER_KEY,
    );

    if (encoded === undefined || encoded === '') {
      throw new Error(
        `${SecurityConfigKeyEnum.ENCRYPTION_MASTER_KEY} is required`,
      );
    }

    const key = Buffer.from(encoded, 'base64');

    if (key.length !== ENCRYPTION_KEY_LENGTH_BYTES) {
      throw new Error(
        `${SecurityConfigKeyEnum.ENCRYPTION_MASTER_KEY} must decode to ${String(ENCRYPTION_KEY_LENGTH_BYTES)} bytes (base64)`,
      );
    }

    this.masterKey = key;
  }

  /**
   * Encrypts a UTF-8 string.
   *
   * @param plaintext Value to protect.
   * @param context Tenant or record scope, for example the organization id.
   * @returns Serialized payload safe to store in a text column.
   */
  encrypt(plaintext: string, context: string): string {
    const iv = randomBytes(ENCRYPTION_IV_LENGTH_BYTES);
    const cipher = createCipheriv(
      ENCRYPTION_ALGORITHM,
      this.deriveKey(context),
      iv,
      {
        authTagLength: ENCRYPTION_AUTH_TAG_LENGTH_BYTES,
      },
    );

    cipher.setAAD(Buffer.from(context, 'utf8'));

    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    return this.serialize({ iv, tag: cipher.getAuthTag(), ciphertext });
  }

  /**
   * Decrypts a payload produced by `encrypt`.
   * Any tampering, wrong context, or wrong key results in the same generic error.
   *
   * @param payload Serialized payload.
   * @param context The exact context used when encrypting.
   * @returns The original UTF-8 string.
   */
  decrypt(payload: string, context: string): string {
    try {
      const { iv, tag, ciphertext } = this.parse(payload);
      const decipher = createDecipheriv(
        ENCRYPTION_ALGORITHM,
        this.deriveKey(context),
        iv,
        {
          authTagLength: ENCRYPTION_AUTH_TAG_LENGTH_BYTES,
        },
      );

      decipher.setAAD(Buffer.from(context, 'utf8'));
      decipher.setAuthTag(tag);

      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString('utf8');
    } catch (error: unknown) {
      this.logger.error(
        `Decryption failed: ${error instanceof Error ? error.name : 'UnknownError'}`,
      );
      throw new InternalServerErrorException('Unable to decrypt data');
    }
  }

  /**
   * Derives a context-specific 256-bit key from the master key.
   *
   * @param context Tenant or record scope.
   * @returns Derived key bytes.
   */
  private deriveKey(context: string): Buffer {
    return Buffer.from(
      hkdfSync(
        'sha256',
        this.masterKey,
        Buffer.alloc(0),
        `${ENCRYPTION_HKDF_INFO_PREFIX}:${context}`,
        ENCRYPTION_KEY_LENGTH_BYTES,
      ),
    );
  }

  /**
   * Serializes payload parts into the storable string format.
   *
   * @param payload Parts to serialize.
   * @returns Versioned payload string.
   */
  private serialize(payload: IEncryptedPayload): string {
    return [
      ENCRYPTION_PAYLOAD_VERSION,
      payload.iv.toString('base64url'),
      payload.tag.toString('base64url'),
      payload.ciphertext.toString('base64url'),
    ].join(ENCRYPTION_PAYLOAD_SEPARATOR);
  }

  /**
   * Parses and structurally validates a stored payload.
   *
   * @param payload Serialized payload.
   * @returns Decoded parts.
   * @throws Error when the format, version, or lengths are invalid.
   */
  private parse(payload: string): IEncryptedPayload {
    const segments = payload.split(ENCRYPTION_PAYLOAD_SEPARATOR);

    if (segments.length !== ENCRYPTION_PAYLOAD_SEGMENT_COUNT) {
      throw new Error('Malformed payload');
    }

    const [version, ivSegment, tagSegment, ciphertextSegment] = segments;

    if (version !== ENCRYPTION_PAYLOAD_VERSION) {
      throw new Error('Unsupported payload version');
    }

    const iv = Buffer.from(ivSegment ?? '', 'base64url');
    const tag = Buffer.from(tagSegment ?? '', 'base64url');

    if (
      iv.length !== ENCRYPTION_IV_LENGTH_BYTES ||
      tag.length !== ENCRYPTION_AUTH_TAG_LENGTH_BYTES
    ) {
      throw new Error('Malformed payload');
    }

    return {
      iv,
      tag,
      ciphertext: Buffer.from(ciphertextSegment ?? '', 'base64url'),
    };
  }
}
