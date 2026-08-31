import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@infrastructure/redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(private readonly redisService: RedisService) {}

  async isHealthy(): Promise<{ status: string; error?: string }> {
    try {
      const client = this.redisService.getClient();
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
