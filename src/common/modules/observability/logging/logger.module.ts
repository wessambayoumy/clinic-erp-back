import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Exposes the structured JSON `LoggerService` application-wide.
 * `@Global()` so any provider can inject the logger without importing this
 * module, giving one shared instance instead of a copy per module.
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
