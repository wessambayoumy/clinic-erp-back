/**
 * Resolved Argon2id configuration used by `HashService`.
 */
export interface IArgon2Config {
  /** Memory cost in KiB. */
  readonly memoryCost: number;
  /** Number of iterations. */
  readonly timeCost: number;
  /** Number of lanes. */
  readonly parallelism: number;
  /** Optional server-side secret mixed into every hash, or null when disabled. */
  readonly pepper: Buffer | null;
}
