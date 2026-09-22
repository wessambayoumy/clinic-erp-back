import { LoggerService } from '@common/observability/logging/logger.service';
import {
  PrismaTransaction,
  TransactionService,
} from '@common/database/transaction';
import type {
  IBaseRepository,
  IPaginatedResult,
  IPaginationOptions,
} from './interfaces';

/**
 * Generic tenant-aware repository base class for Prisma ORM 8.
 *
 * Every method wraps its query in `TransactionService.run()`, which applies
 * the caller's RLS context (`set_config(...)`) before the callback executes.
 * Concrete repositories must NEVER bypass this by querying the top-level
 * client directly outside of `run()` — doing so re-opens the tenant-isolation
 * gap that `RLSService.setContext()` used to leave open as a no-op.
 *
 * Subclasses only implement `getCollection()`, pointing it at the relevant
 * model's collection on the transaction (e.g. `tx.orm.public.Patient`).
 *
 * Note on `update()`/`delete()`: Prisma ORM 8 returns `null` on no match
 * instead of throwing, unlike v7's `RecordNotFound`. This class passes that
 * behavior straight through — callers handle the `null` case themselves.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class PatientRepository extends BaseRepository<
 *   Scalars<Models.public_Patient>,
 *   { id: string } | Record<string, unknown>,
 *   PatientCreateInput,
 *   PatientUpdateInput
 * > {
 *   protected getCollection(tx: PrismaTransaction) {
 *     return tx.orm.public.Patient;
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<
  TModel,
  TWhereUniqueInput,
  TWhereInput,
  TCreateInput,
  TUpdateInput,
> implements IBaseRepository<
  TModel,
  TWhereUniqueInput,
  TWhereInput,
  TCreateInput,
  TUpdateInput
> {
  protected constructor(
    protected readonly transactionService: TransactionService,
    protected readonly logger: LoggerService,
  ) {}

  /**
   * Returns this repository's model collection, scoped to the given
   * transaction. Must be implemented per concrete repository.
   */
  protected abstract getCollection(tx: PrismaTransaction): any;

  public async findById(where: TWhereUniqueInput): Promise<TModel | null> {
    return this.transactionService.run(async (tx) =>
      this.getCollection(tx).first(where),
    );
  }

  public async findMany(
    where: TWhereInput,
    pagination: IPaginationOptions,
  ): Promise<IPaginatedResult<TModel>> {
    const { page, limit } = pagination;
    const skip: number = (page - 1) * limit;

    return this.transactionService.run(async (tx) => {
      const collection = this.getCollection(tx);
      const [data, { total }]: [TModel[], { total: number }] =
        await Promise.all([
          collection.where(where).offset(skip).limit(limit).all(),
          collection
            .where(where)
            .aggregate((agg: any) => ({ total: agg.count() })),
        ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  public async create(data: TCreateInput): Promise<TModel> {
    return this.transactionService.run(async (tx) =>
      this.getCollection(tx).create(data),
    );
  }

  public async update(
    where: TWhereUniqueInput,
    data: TUpdateInput,
  ): Promise<TModel> {
    return this.transactionService.run(async (tx) =>
      this.getCollection(tx).where(where).update(data),
    );
  }

  public async delete(where: TWhereUniqueInput): Promise<TModel> {
    return this.transactionService.run(async (tx) =>
      this.getCollection(tx).where(where).delete(),
    );
  }

  public async count(where: TWhereInput): Promise<number> {
    return this.transactionService.run(async (tx) => {
      const { total } = await this.getCollection(tx)
        .where(where)
        .aggregate((agg: any) => ({ total: agg.count() }));
      return total;
    });
  }
}
