import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';

@Injectable()
export class DatabaseHealthIndicator {
  private readonly logger = new Logger(DatabaseHealthIndicator.name);

  constructor(private readonly prisma: PrismaService) {}

  async isHealthy(): Promise<{ status: string; error?: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(
        `Database health check failed: ${(error as Error).message}`,
      );
      return { status: 'error', error: (error as Error).message };
    }
  }
}
