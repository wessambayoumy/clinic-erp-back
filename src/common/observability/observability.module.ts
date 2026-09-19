import { Module } from '@nestjs/common';
import { LoggerModule } from './logging/logger.module';
import { MetricsModule } from './metrics/metrics.module';
import { TracingModule } from './tracing/tracing.module';

const modules = [LoggerModule, MetricsModule, TracingModule];
@Module({
  imports: modules,
  exports: modules,
})
export class ObservabilityModule {}
