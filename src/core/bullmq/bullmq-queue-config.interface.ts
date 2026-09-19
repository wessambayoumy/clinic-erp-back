export interface BullMQQueueConfig {
  name: string;
  defaultJobOptions?: {
    attempts?: number;
    backoff?: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    removeOnComplete?: boolean;
    removeOnFail?: boolean;
  };
}
