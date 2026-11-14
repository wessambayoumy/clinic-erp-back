import type { MetricsService } from '@/common/modules/observability/metrics/metrics.service';
import type { TracingService } from '@/common/modules/observability/tracing/tracing.service';

/** Host instance shape required by the `@Observed()` decorator. */
export interface IObservableInstance {
  tracingService: TracingService;
  metricsService?: MetricsService;
}
