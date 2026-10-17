import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Shared cursor/offset pagination, search and sort query parameters used by
 * every paginated list endpoint (`?cursor|page&limit&search&sort`).
 */
export class PaginationQueryDto {
  /** Opaque keyset cursor for cursor-based pagination; takes precedence over `page`. */
  @IsOptional()
  @IsString()
  cursor?: string;

  /** 1-indexed page number for offset-based pagination. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** Number of records to return per page. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /** Free-text search term applied to the endpoint's searchable columns. */
  @IsOptional()
  @IsString()
  search?: string;

  /** Sort expression, for example `createdAt:desc`. */
  @IsOptional()
  @IsString()
  sort?: string;
}
