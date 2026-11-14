import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import type { IHealthStatus } from '@/shared/interfaces/health';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  public async isHealthy(): Promise<IHealthStatus> {
    try {
      const plan = this.prisma.client.raw.sql`SELECT 1`.affectedCount().build();
      await this.prisma.client.runtime().execute(plan);
      this.logger.log('Database health check passed');
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(
        `Database health check failed: ${(error as Error).message}`,
      );
      return { status: 'error', error: (error as Error).message };
    }
  }
}
