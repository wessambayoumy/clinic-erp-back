/**
 * Environment variable names read by the security services.
 */
export enum SecurityConfigKeyEnum {
  ARGON2_MEMORY_COST = 'ARGON2_MEMORY_COST',
  ARGON2_TIME_COST = 'ARGON2_TIME_COST',
  ARGON2_PARALLELISM = 'ARGON2_PARALLELISM',
  HASH_PEPPER = 'HASH_PEPPER',
  ENCRYPTION_MASTER_KEY = 'ENCRYPTION_MASTER_KEY',
}
