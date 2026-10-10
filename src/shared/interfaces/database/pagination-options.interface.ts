/**
 * Pagination input accepted by any `findMany`-style repository method.
 * Offset-based pagination is used here for simplicity; switch to a cursor
 * shape in this same file if a given list endpoint needs keyset pagination.
 */
export interface IPaginationOptions {
  /** 1-indexed page number. */
  page: number;

  /** Number of records per page. */
  limit: number;
}
