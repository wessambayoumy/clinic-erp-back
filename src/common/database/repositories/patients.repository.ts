import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { PrismaTransaction, TransactionService } from '@common/database/transaction';
import { BaseRepository } from './base.repository';
import { Observed } from '@/common/decorators';

/** Tenant-aware repository for the Patient model owned by this feature. */
@Observed()
@Injectable()
export class PatientsRepository extends BaseRepository<
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

  /** Selects the Patient collection from the scoped transaction. */
  protected getCollection(tx: PrismaTransaction): object {
    return (tx.orm.public as Record<string, object>).Patient;
  }
}
