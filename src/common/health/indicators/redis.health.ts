import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { RedisService } from '@/core/redis/redis.service';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('redis');

    try {
      const client = this.redisService.client;
      if (!client) {
        return indicator.down('Redis client is not connected');
      }
      await client.ping();
      return indicator.up();
    } catch (error: unknown) {
      this.logger.error(
        `Redis health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return indicator.down();
    }
  }
}
