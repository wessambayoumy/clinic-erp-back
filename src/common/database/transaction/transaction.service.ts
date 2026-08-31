import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { RLSService } from '../rls/rls.service';
import { TransactionContext } from './transaction.context';

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
   * Note: This is a placeholder implementation that calls the callback directly.
   * When Prisma's full transaction API is available, this should use $transaction.
   */
  async run<T>(
    context: TransactionContext,
    callback: (client: any) => Promise<T>,
  ): Promise<T> {
    // Set RLS context
    this.rlsService.setContext({
      userId: context.userId,
      organizationId: context.organizationId,
      locationId: context.locationId,
    });

    try {
      const result = await callback(this.prisma);
      this.logger.debug(
        `Transaction completed for org: ${context.organizationId}`,
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Transaction failed: ${message}`);
      throw error;
    }
  }
}
