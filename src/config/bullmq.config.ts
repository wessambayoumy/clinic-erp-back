import { registerAs } from '@nestjs/config';

export default registerAs('bullmq', () => ({
  redisUrl: process.env.REDIS_URL,
}));
