import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { LoggerService } from '@common/observability/logging/logger.service';

@Module({
  providers: [RedisService, LoggerService],
  exports: [RedisService],
})
export class RedisModule {}
