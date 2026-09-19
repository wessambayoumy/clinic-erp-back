import { Module } from '@nestjs/common';
import { TracingService } from './tracing.service';
import { LoggerService } from '@common/observability/logging/logger.service';

@Module({
  providers: [TracingService, LoggerService],
  exports: [TracingService],
})
export class TracingModule {}
