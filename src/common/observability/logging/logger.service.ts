import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService extends Logger {
  constructor(private configService: ConfigService) {
    super('App');
  }

  log(message: string, context?: string, meta?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context: context || this.context,
      meta,
    };
    console.log(JSON.stringify(logEntry));
  }

  error(message: string, trace?: string, context?: string, meta?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      trace,
      context: context || this.context,
      meta,
    };
    console.error(JSON.stringify(logEntry));
  }

  warn(message: string, context?: string, meta?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context: context || this.context,
      meta,
    };
    console.warn(JSON.stringify(logEntry));
  }

  debug(message: string, context?: string, meta?: any): void {
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
      console.debug(JSON.stringify(logEntry));
    }
  }
}
