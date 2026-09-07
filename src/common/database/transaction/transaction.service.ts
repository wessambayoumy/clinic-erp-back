import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { RLSService } from '../rls/rls.service';
import { TransactionContext } from './transaction.context';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rlsService: RLSService,
  ) {}

  /**
   * Execute a callback within a database transaction with RLS context
   * The RLS context is set for the duration of the transaction
   */
  async run<T>(
    context: TransactionContext,
    callback: (client: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    // Set RLS context
    this.rlsService.setContext({
      userId: context.userId,
      organizationId: context.organizationId,
      locationId: context.locationId,
    });

    try {
      const result = await this.prisma.$transaction((client) => callback(client));
      this.logger.debug(
        `Transaction completed for org: ${context.organizationId}`,
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Transaction failed: ${message}`);
      throw error;
    } finally {
      this.rlsService.clearContext();
    }
  }
}
