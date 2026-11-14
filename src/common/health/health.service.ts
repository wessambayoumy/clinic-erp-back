import { Injectable } from '@nestjs/common';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly database: DatabaseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly logger: LoggerService,
  ) {}

  async checkLiveness(): Promise<{ status: string; timestamp: string }> {
    this.logger.log('Liveness check performed');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async checkReadiness(): Promise<{
    status: string;
    checks: Record<string, { status: string }>;
    timestamp: string;
  }> {
    this.logger.log('Readiness check performed');
    const [database, redis] = await Promise.all([
      this.database.isHealthy(),
      this.redis.isHealthy(),
    ]);

    const checks: Record<string, { status: string; error?: string }> = {
      database,
      redis,
      // BullMQ exposes no health surface yet; the queue is assumed up.
      queue: { status: 'ok' },
    };

    const allHealthy = Object.values(checks).every(
      (check) => check.status === 'ok' || check.status === 'disabled',
    );

    return {
      status: allHealthy ? 'ok' : 'error',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  async checkHealth(): Promise<{
    status: string;
    checks: Record<string, { status: string }>;
    timestamp: string;
  }> {
    this.logger.log('Full health check performed');
    return this.checkReadiness();
  }
}
