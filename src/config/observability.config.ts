import { registerAs } from '@nestjs/config';

export default registerAs('observability', () => ({
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  tracing: {
    enabled: process.env.TRACING_ENABLED === 'true',
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED === 'true',
  },
}));
