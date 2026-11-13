import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import authConfig from './auth.config';
import redisConfig from './redis.config';
import bullmqConfig from './bullmq.config';
import observabilityConfig from './observability.config';
import emailConfig from './email.config';
import { envSchema } from './config.schema';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        redisConfig,
        bullmqConfig,
        observabilityConfig,
        emailConfig,
      ],
      validate: (config: Record<string, unknown>): Record<string, unknown> => ({
        ...config,
        ...envSchema.parse(config),
      }),
      envFilePath: '.env.dev',
      cache: true,
    }),
  ],
})
export class ConfigurationModule {}
