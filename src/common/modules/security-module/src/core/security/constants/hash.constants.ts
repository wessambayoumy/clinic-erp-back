/**
 * Default Argon2id memory cost in KiB (64 MiB).
 * Well above the OWASP minimum of 19 MiB while still safe for concurrent logins.
 */
export const DEFAULT_ARGON2_MEMORY_COST_KIB = 65_536;

/** Default Argon2id iteration count (time cost). */
export const DEFAULT_ARGON2_TIME_COST = 3;

/** Default Argon2id lanes. Kept at 1 because libuv threads already provide request-level parallelism. */
export const DEFAULT_ARGON2_PARALLELISM = 1;

/** Lowest memory cost (KiB) the service accepts, matching the OWASP minimum profile. */
export const MIN_ARGON2_MEMORY_COST_KIB = 19_456;

/** Lowest iteration count the service accepts. */
export const MIN_ARGON2_TIME_COST = 2;

/** Lowest parallelism the service accepts. */
export const MIN_ARGON2_PARALLELISM = 1;

/** Minimum pepper length in characters when a pepper is configured. */
export const MIN_PEPPER_LENGTH = 32;
