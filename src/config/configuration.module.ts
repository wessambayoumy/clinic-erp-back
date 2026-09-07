import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import authConfig from './auth.config';
import redisConfig from './redis.config';
import bullmqConfig from './bullmq.config';
import observabilityConfig from './observability.config';

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
      ],
      envFilePath: '.env.dev',
      cache: true,
    }),
  ],
})
export class ConfigurationModule {}
