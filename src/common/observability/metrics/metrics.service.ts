import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly metrics: Map<string, number> = new Map();

  constructor(private readonly configService: ConfigService) {}

  increment(
    metricName: string,
    value: number = 1,
    labels?: Record<string, string>,
  ): void {
    const metricsEnabled = this.configService.get<boolean>(
      'observability.metrics.enabled',
    );
    if (metricsEnabled) {
      const key = this.getMetricKey(metricName, labels);
      const current = this.metrics.get(key) || 0;
      this.metrics.set(key, current + value);
    }
  }

  gauge(
    metricName: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    const metricsEnabled = this.configService.get<boolean>(
      'observability.metrics.enabled',
    );
    if (metricsEnabled) {
      const key = this.getMetricKey(metricName, labels);
      this.metrics.set(key, value);
    }
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}
