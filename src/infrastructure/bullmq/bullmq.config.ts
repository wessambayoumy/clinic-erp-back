// BullMQ configuration factory
// This file will be used to create queue configurations
// Actual queues will be defined in their respective bounded contexts

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
