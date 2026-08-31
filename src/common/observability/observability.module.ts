import { Module } from '@nestjs/common';
import { LoggerModule } from './logging/logger.module';
import { MetricsModule } from './metrics/metrics.module';
import { TracingModule } from './tracing/tracing.module';

@Module({
  imports: [LoggerModule, MetricsModule, TracingModule],
  exports: [LoggerModule, MetricsModule, TracingModule],
})
export class ObservabilityModule {}
