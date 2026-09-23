/**
 * Standard envelope returned by any paginated repository query.
 */
export interface IPaginatedResult<TModel> {
  data: TModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
