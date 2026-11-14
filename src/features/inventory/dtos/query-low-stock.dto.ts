import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '@shared/dtos/shared';

/**
 * Query params for GET /inventory/alerts/low-stock.
 */
export class QueryLowStockDto extends PaginationQueryDto {
  /** Restrict results to a single location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;
}
