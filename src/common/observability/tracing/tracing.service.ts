import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';

@Injectable()
export class TracingService {
  private readonly logger = new Logger(TracingService.name);

  constructor(private readonly configService: ConfigService) {}

  startSpan(
    spanName: string,
    attributes?: Record<string, string | number>,
  ): { spanId: string } {
    const tracingEnabled = this.configService.get<boolean>(
      'observability.tracing.enabled',
    );
    if (tracingEnabled) {
      const spanId = this.generateSpanId();
      this.logger.debug(
        `Span started: ${spanName} (${spanId})`,
        'TracingService',
        {
          attributes,
        },
      );
      return { spanId };
    }
    return { spanId: '' };
  }

  endSpan(spanId: string, attributes?: Record<string, string | number>): void {
    const tracingEnabled = this.configService.get<boolean>(
      'observability.tracing.enabled',
    );
    if (tracingEnabled) {
      this.logger.debug(`Span ended: ${spanId}`, 'TracingService', {
        attributes,
      });
    }
  }

  private generateSpanId(): string {
    return randomBytes(8).toString('hex');
  }
}
