import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@common/observability/logging/logger.service';

/** Hard ceiling on distinct metric+label combinations to prevent cardinality-driven memory exhaustion. */
const MAX_SERIES = 10_000;

/**
 * In-memory counter/gauge store for lightweight, dependency-free metrics.
 *
 * @remarks
 * This is NOT a Prometheus client — `getMetrics()` returns plain JSON, not
 * Prometheus exposition format. For real production scraping, wrap
 * `prom-client` instead (see note below); this class is best suited for
 * internal dashboards or debug endpoints.
 *
 * In a clustered/multi-instance deployment (pm2 cluster, multiple pods),
 * each process holds its own independent Map — metrics are NOT aggregated
 * across instances.
 */
@Injectable()
export class MetricsService {
  private readonly metrics = new Map<string, number>();
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    // Read once at construction rather than on every call.
    this.enabled =
      this.configService.get<boolean>('observability.metrics.enabled') ?? false;
  }

  /**
   * Increments a counter metric by `value` (default 1).
   * Intended for monotonically increasing values (request counts, error counts).
   *
   * @param metricName - Base metric name, e.g. `'http_requests_total'`.
   * @param value - Amount to add. Defaults to 1.
   * @param labels - Optional label set for dimensioning (e.g. `{ route, method }`).
   */
  increment(
    metricName: string,
    value = 1,
    labels?: Record<string, string>,
  ): void {
    if (!this.enabled) return;
    const key = this.getMetricKey(metricName, labels);
    if (!this.metrics.has(key) && this.metrics.size >= MAX_SERIES) {
      this.logger.warn(
        `Metric series cap reached (${MAX_SERIES}); dropping "${key}"`,
      );
      return;
    }
    this.metrics.set(key, (this.metrics.get(key) ?? 0) + value);
  }

  /**
   * Sets a gauge metric to an absolute value.
   * Intended for point-in-time measurements (queue depth, active connections).
   *
   * @param metricName - Base metric name.
   * @param value - Absolute value to store (overwrites previous).
   * @param labels - Optional label set.
   */
  gauge(
    metricName: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    if (!this.enabled) return;
    const key = this.getMetricKey(metricName, labels);
    if (!this.metrics.has(key) && this.metrics.size >= MAX_SERIES) {
      this.logger.warn(
        `Metric series cap reached (${MAX_SERIES}); dropping "${key}"`,
      );
      return;
    }
    this.metrics.set(key, value);
  }

  /** Returns a snapshot of all metrics as a plain object, keyed by Prometheus-style label string. */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Builds a stable, collision-resistant storage key from a metric name and labels.
   * Sorts label keys so `{a,b}` and `{b,a}` collapse to the same series,
   * and escapes quotes/backslashes in label values to prevent key corruption.
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return name;

    const labelStr = Object.keys(labels)
      .sort()
      .map((k) => `${k}="${this.escapeLabel(labels[k])}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  private escapeLabel(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}