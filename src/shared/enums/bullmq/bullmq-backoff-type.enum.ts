/**
 * Backoff strategies supported by BullMQ job retries.
 */
export enum BullMQBackoffTypeEnum {
  /** Delay grows exponentially between successive attempts. */
  EXPONENTIAL = 'exponential',
  /** Delay stays constant between successive attempts. */
  FIXED = 'fixed',
}
