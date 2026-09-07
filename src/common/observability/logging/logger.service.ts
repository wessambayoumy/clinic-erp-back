import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService extends Logger {
  constructor(private configService: ConfigService) {
    super('App');
  }

  log(message: string, context?: string, meta?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context: context || this.context,
      meta,
    };
    super.log(JSON.stringify(logEntry), context);
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      trace,
      context: context || this.context,
      meta,
    };
    super.error(JSON.stringify(logEntry), trace, context);
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context: context || this.context,
      meta,
    };
    super.warn(JSON.stringify(logEntry), context);
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>): void {
    const logLevel = this.configService.get<string>(
      'observability.logging.level',
    );
    if (logLevel === 'debug') {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        context: context || this.context,
        meta,
      };
      super.debug(JSON.stringify(logEntry), context);
    }
  }
}
