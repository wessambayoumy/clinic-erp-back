import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { LoggerService } from '@common/observability/logging/logger.service';

/** Internal record for an in-flight span. */
interface ActiveSpan {
  name: string;
  startedAt: number; // ms, from performance.now()
  parentSpanId?: string;
}

/**
 * Lightweight span tracking backed by debug logs.
 *
 * @remarks
 * This is NOT a distributed tracing solution — spans are process-local,
 * have no trace-context propagation across service boundaries (e.g. HTTP
 * calls to the DICOM microservice), and are not exported to any collector.
 * For real cross-service tracing, see the OpenTelemetry recommendation below.
 */
@Injectable()
export class TracingService {
  private readonly enabled: boolean;
  private readonly activeSpans = new Map<string, ActiveSpan>();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.enabled =
      this.configService.get<boolean>('observability.tracing.enabled') ?? false;
  }

  /**
   * Starts a span, recording its start time for later duration calculation.
   *
   * @param spanName - Human-readable operation name (e.g. `'db.query'`, `'s3.upload'`).
   * @param attributes - Optional key/value context attached to the span.
   * @param parentSpanId - Optional parent span, to nest this under an in-flight span.
   * @returns The generated span ID, or `''` if tracing is disabled.
   */
  startSpan(
    spanName: string,
    attributes?: Record<string, string | number>,
    parentSpanId?: string,
  ): { spanId: string } {
    if (!this.enabled) return { spanId: '' };

    const spanId = this.generateSpanId();
    this.activeSpans.set(spanId, {
      name: spanName,
      startedAt: performance.now(),
      parentSpanId,
    });

    this.logger.debug(
      `Span started: ${spanName} (${spanId})`,
      'TracingService',
      {
        spanId,
        parentSpanId,
        attributes,
      },
    );

    return { spanId };
  }

  /**
   * Ends a span and logs its duration.
   *
   * @param spanId - ID returned by {@link startSpan}. No-ops with a warning if unknown.
   * @param attributes - Optional additional attributes to merge in at close time.
   */
  endSpan(spanId: string, attributes?: Record<string, string | number>): void {
    if (!this.enabled || !spanId) return;

    const span = this.activeSpans.get(spanId);
    if (!span) {
      this.logger.warn(
        `endSpan called with unknown or already-closed spanId: ${spanId}`,
        'TracingService',
      );
      return;
    }

    const durationMs = performance.now() - span.startedAt;
    this.activeSpans.delete(spanId);

    this.logger.debug(
      `Span ended: ${span.name} (${spanId})`,
      'TracingService',
      {
        spanId,
        parentSpanId: span.parentSpanId,
        durationMs: Math.round(durationMs * 1000) / 1000,
        attributes,
      },
    );
  }

  private generateSpanId(): string {
    return randomBytes(8).toString('hex');
  }
}
