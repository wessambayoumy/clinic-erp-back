import type { BullMQBackoffTypeEnum } from '@/shared/enums/bullmq';

/**
 * Declarative configuration for a queue registered by `BullMQModule`.
 */
export interface IBullMQQueueConfig {
  /** Queue name, unique within the Redis connection. */
  name: string;
  /** Defaults applied to every job added to the queue. */
  defaultJobOptions?: {
    /** Number of times a failing job is retried. */
    attempts?: number;
    /** Retry delay strategy. */
    backoff?: {
      type: BullMQBackoffTypeEnum;
      delay: number;
    };
    /** Drop jobs from Redis once they complete successfully. */
    removeOnComplete?: boolean;
    /** Drop jobs from Redis once they exhaust their retries. */
    removeOnFail?: boolean;
  };
}
