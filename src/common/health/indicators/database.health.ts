import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { LoggerService } from '@common/observability/logging/logger.service';

export interface IHealthStatus {
  status: string;
  error?: string;
}

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
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(
        `Database health check failed: ${(error as Error).message}`,
      );
      return { status: 'error', error: (error as Error).message };
    }
  }
}

