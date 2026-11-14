import { Injectable } from '@nestjs/common';
import { RedisService } from '@/core/redis/redis.service';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
  ) {}

  async isHealthy(): Promise<{ status: string; error?: string }> {
    try {
      const client = this.redisService.client;
      if (!client) {
        return { status: 'disabled' };
      }
      await client.ping();
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(
        `Redis health check failed: ${(error as Error).message}`,
      );
      return { status: 'error', error: (error as Error).message };
    }
  }
}
