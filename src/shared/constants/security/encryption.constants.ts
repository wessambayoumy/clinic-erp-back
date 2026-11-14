/** Authenticated cipher used for field-level encryption. */
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm' as const;

/** Version tag written at the start of every payload so the format can evolve. */
export const ENCRYPTION_PAYLOAD_VERSION = 'v1';

/** Separator between payload segments. Not part of the base64url alphabet. */
export const ENCRYPTION_PAYLOAD_SEPARATOR = '.';

/** AES-256 key length in bytes. */
export const ENCRYPTION_KEY_LENGTH_BYTES = 32;

/** GCM nonce length in bytes (96 bits, the recommended size). */
export const ENCRYPTION_IV_LENGTH_BYTES = 12;

/** GCM authentication tag length in bytes. */
export const ENCRYPTION_AUTH_TAG_LENGTH_BYTES = 16;

/** Domain-separation prefix fed into HKDF when deriving per-context keys. */
export const ENCRYPTION_HKDF_INFO_PREFIX = 'clinic-erp:field-encryption';

/** Number of segments a well-formed payload splits into: version, iv, tag, ciphertext. */
export const ENCRYPTION_PAYLOAD_SEGMENT_COUNT = 4;
