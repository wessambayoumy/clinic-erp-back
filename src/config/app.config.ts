import { registerAs } from '@nestjs/config';
export enum ConfigEnum {
  app = 'app',
  auth = 'auth',
  bullmq = 'bullmq',
  database = 'database',
  observability = 'observability',
  redis = 'redis',
}
export enum AppConfigEnum{
  nodeEnv = 'app.nodeEnv',
  port = 'app.port',
  apiPrefix = 'app.apiPrefix',
  corsOrigin = 'app.corsOrigin',
}
export default registerAs(ConfigEnum.app, () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
}));
export const ConfigConsts = {
  app: {
    development: AppConfigEnum.nodeEnv,
    port: AppConfigEnum.port,
    apiPrefix: AppConfigEnum.apiPrefix,
    corsOrigin: AppConfigEnum.corsOrigin,
  },
};
