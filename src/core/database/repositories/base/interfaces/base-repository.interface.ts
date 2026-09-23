import type { IPaginatedResult } from './paginated-result.interface';
import type { IPaginationOptions } from './pagination-options.interface';

/**
 * Contract for a tenant-scoped CRUD repository.
 * Every method resolves data already scoped to the caller's tenant context —
 * scoping is enforced by RLS at the database layer, never re-implemented
 * with an application-level `organizationId` filter (see BaseRepository).
 */
export interface IBaseRepository<
  TModel,
  TWhereUniqueInput,
  TWhereInput,
  TCreateInput,
  TUpdateInput,
> {
  findById(where: TWhereUniqueInput): Promise<TModel | null>;

  findMany(
    where: TWhereInput,
    pagination: IPaginationOptions,
  ): Promise<IPaginatedResult<TModel>>;

  create(data: TCreateInput): Promise<TModel>;

  update(where: TWhereUniqueInput, data: TUpdateInput): Promise<TModel>;

  delete(where: TWhereUniqueInput): Promise<TModel>;

  count(where: TWhereInput): Promise<number>;
}
