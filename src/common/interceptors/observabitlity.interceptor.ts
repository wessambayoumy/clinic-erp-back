import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { MetricsService, TracingService } from '../modules/observability';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
  constructor(
    private readonly tracingService: TracingService,
    private readonly metricsService: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const name = `${context.getClass().name}.${context.getHandler().name}`;
    const { spanId } = this.tracingService.startSpan(name);

    return next.handle().pipe(
      tap(() => {
        this.metricsService.increment(`${name}_total`, 1, {
          status: 'success',
        });
        this.tracingService.endSpan(spanId);
      }),
      catchError((error: unknown) => {
        this.metricsService.increment(`${name}_total`, 1, { status: 'error' });
        this.tracingService.endSpan(spanId);
        throw error;
      }),
    );
  }
}
