import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { TransactionService } from '@common/database/transaction';
import type { PrismaTransaction } from '@/shared/types';
import { BaseRepository } from '@common/database/repositories/base.repository';
import { Observed } from '@/common/decorators';

/** Tenant-aware repository for the InventoryItem model owned by this feature. */
@Observed()
@Injectable()
export class InventoryRepository extends BaseRepository<
  Record<string, unknown>,
  { id: string },
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>
> {
  public constructor(
    transactionService: TransactionService,
    logger: LoggerService,
  ) {
    super(transactionService, logger);
  }

  /** Selects the InventoryItem collection from the scoped transaction. */
  protected getCollection(tx: PrismaTransaction): object {
    return (tx.orm.public as Record<string, object>).InventoryItem;
  }
}
