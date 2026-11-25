import { Injectable } from '@nestjs/common';
import { HealthCheckService, type HealthCheckResult } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { S3HealthIndicator } from './indicators/s3.health';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly database: DatabaseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly s3: S3HealthIndicator,
    private readonly healthCheckService: HealthCheckService,
    private readonly logger: LoggerService,
  ) {}

  public async checkLiveness(): Promise<HealthCheckResult> {
    this.logger.log('Liveness check performed');
    return this.healthCheckService.check([]);
  }

  public async checkReadiness(): Promise<HealthCheckResult> {
    this.logger.log('Readiness check performed');
    return this.healthCheckService.check([
      () => this.database.isHealthy(),
      () => this.redis.isHealthy(),
      () => this.s3.isHealthy(),
    ]);
  }

  public async checkHealth(): Promise<HealthCheckResult> {
    this.logger.log('Full health check performed');
    return this.checkReadiness();
  }
}
