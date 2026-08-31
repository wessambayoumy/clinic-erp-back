import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { RedisService } from '@infrastructure/redis/redis.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async checkLiveness() {
    this.logger.log('Liveness check performed');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async checkReadiness() {
    this.logger.log('Readiness check performed');
    const checks: Record<string, { status: string; error?: string }> = {
      database: { status: 'ok' },
      redis: { status: 'ok' },
      queue: { status: 'ok' },
    };

    // Database health check - placeholder
    try {
      if (this.prisma) {
        checks.database.status = 'ok';
      } else {
        checks.database.status = 'error';
      }
    } catch (error) {
      checks.database.status = 'error';
      checks.database.error =
        error instanceof Error ? error.message : String(error);
    }

    // Redis health check
    try {
      if (this.redis.isConnected) {
        checks.redis.status = 'ok';
      } else {
        checks.redis.status = 'disabled';
      }
    } catch (error) {
      checks.redis.status = 'error';
      checks.redis.error =
        error instanceof Error ? error.message : String(error);
    }

    checks.queue.status = 'ok'; // Queue health checked separately

    const allHealthy = Object.values(checks).every(
      (check) => check.status === 'ok' || check.status === 'disabled',
    );

    return {
      status: allHealthy ? 'ok' : 'error',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  async checkHealth() {
    this.logger.log('Full health check performed');
    return this.checkReadiness();
  }
}
