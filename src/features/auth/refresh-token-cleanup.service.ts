import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';

/** Removes expired persisted refresh tokens on a daily schedule. */
@Injectable()
export class RefreshTokenCleanupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /** Deletes expired refresh-token records every day at 03:00. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM, { waitForCompletion: true })
  public async removeExpiredTokens(): Promise<void> {
    try {
      const plan = this.prisma.client.raw.sql`
        DELETE FROM "refresh_tokens"
        WHERE "expiresAt" <= NOW()
      `
        .affectedCount()
        .build();
      const result = await this.prisma.client.runtime().execute(plan);
      if (result.affectedRows > 0) {
        this.logger.log(
          `Removed ${result.affectedRows} expired refresh tokens`,
          'RefreshTokenCleanupService',
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        `Refresh-token cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
