import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator, RedisHealthIndicator } from './indicators';
import { LoggerModule } from '@/common/modules/observability/logging/logger.module';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { RedisModule } from '@/core/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule, LoggerModule],
  controllers: [HealthController],
  providers: [HealthService, DatabaseHealthIndicator, RedisHealthIndicator],
  exports: [HealthService],
})
export class HealthModule {}
