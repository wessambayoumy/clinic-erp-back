import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
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
      envFilePath: ['.env.local', '.env'],
      cache: true,
      validationOptions: {
        abortEarly: false,
      },
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
        DATABASE_URL: Joi.string().uri().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
        }),
        REDIS_URL: Joi.string().uri().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
        }),
        JWT_ACCESS_SECRET: Joi.string().min(32).when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
        }),
        JWT_REFRESH_SECRET: Joi.string().min(32).when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
        }),
        JWT_ISSUER: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
        }),
        JWT_AUDIENCE: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
        }),
      }),
    }),
  ],
})
export class ConfigurationModule {}
