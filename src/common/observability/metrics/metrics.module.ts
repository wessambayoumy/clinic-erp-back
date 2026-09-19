import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { LoggerService } from '@common/observability/logging/logger.service';

@Module({
  providers: [MetricsService, LoggerService],
  exports: [MetricsService],
})
export class MetricsModule {}
