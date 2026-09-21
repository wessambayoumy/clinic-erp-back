import { registerAs } from '@nestjs/config';
import { ConfigEnum } from './config.enum';

export default registerAs(ConfigEnum.app, () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
}));
