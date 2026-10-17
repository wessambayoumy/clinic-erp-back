import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /inventory/stock — pool-aware stock levels.
 */
export class QueryStockDto extends PaginationQueryDto {
  /** Restrict results to a single location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;

  /** Restrict results to a single inventory item. */
  @IsOptional()
  @IsUUID()
  inventoryItemId?: string;
}
