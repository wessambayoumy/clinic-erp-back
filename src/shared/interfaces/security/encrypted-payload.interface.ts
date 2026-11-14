/**
 * Parsed components of an AES-256-GCM payload.
 */
export interface IEncryptedPayload {
  /** Random 96-bit nonce, unique per encryption. */
  readonly iv: Buffer;
  /** GCM authentication tag. */
  readonly tag: Buffer;
  /** Encrypted bytes. */
  readonly ciphertext: Buffer;
}
