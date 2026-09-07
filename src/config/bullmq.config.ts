import { registerAs } from '@nestjs/config';

export default registerAs('bullmq', () => ({
  redisUrl: process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL,
}));