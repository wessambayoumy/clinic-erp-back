import { registerAs } from '@nestjs/config';

export default registerAs('bullmq', () => ({
  connectionString: process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL,
}));
