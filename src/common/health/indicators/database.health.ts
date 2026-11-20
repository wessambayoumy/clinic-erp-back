import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('database');

    try {
      const plan = this.prisma.client.raw.sql`SELECT 1`.affectedCount().build();
      await this.prisma.client.runtime().execute(plan);
      this.logger.log('Database health check passed');
      return indicator.up();
    } catch (error: unknown) {
      this.logger.error(
        `Database health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return indicator.down();
    }
  }
}
