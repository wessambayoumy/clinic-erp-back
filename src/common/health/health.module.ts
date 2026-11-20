import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { S3Client } from '@aws-sdk/client-s3';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import {
  DatabaseHealthIndicator,
  RedisHealthIndicator,
  S3HealthIndicator,
} from './indicators';
import { LoggerModule } from '@/common/modules/observability/logging/logger.module';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { RedisModule } from '@/core/redis/redis.module';
import { S3_CLIENT } from '@/shared/constants/storage';

@Module({
  imports: [TerminusModule, PrismaModule, RedisModule, LoggerModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    S3HealthIndicator,
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): S3Client =>
        new S3Client({
          region: configService.get<string>('AWS_REGION'),
          endpoint: configService.get<string>('AWS_S3_ENDPOINT'),
          forcePathStyle: configService.get<string>('AWS_S3_FORCE_PATH_STYLE') === 'true',
          credentials:
            configService.get<string>('AWS_ACCESS_KEY_ID') !== undefined &&
            configService.get<string>('AWS_SECRET_ACCESS_KEY') !== undefined
              ? {
                  accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
                  secretAccessKey: configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
                }
              : undefined,
        }),
    },
  ],
  exports: [HealthService],
})
export class HealthModule {}
