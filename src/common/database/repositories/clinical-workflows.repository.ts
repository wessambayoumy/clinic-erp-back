import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { PrismaTransaction, TransactionService } from '@common/database/transaction';
import { BaseRepository } from './base.repository';

/** Tenant-aware repository for the FormTemplate model owned by this feature. */
@Injectable()
export class ClinicalWorkflowsRepository extends BaseRepository<
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

  /** Selects the FormTemplate collection from the scoped transaction. */
  protected getCollection(tx: PrismaTransaction): object {
    return (tx.orm.public as Record<string, object>).FormTemplate;
  }
}
