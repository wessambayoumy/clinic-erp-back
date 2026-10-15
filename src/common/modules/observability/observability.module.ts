import { Module } from '@nestjs/common';
import { LoggerModule } from './logging/logger.module';
import { MetricsModule } from './metrics/metrics.module';
import { TracingModule } from './tracing/tracing.module';
import { ObservabilityInterceptor } from '@/common/interceptors/observabitlity.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

const modules = [LoggerModule, MetricsModule, TracingModule];

const providers = [  {
      provide: APP_INTERCEPTOR,
      useClass: ObservabilityInterceptor,
    },];

@Module({
  imports: modules,
  exports: modules,
  providers,
})
export class ObservabilityModule {}
