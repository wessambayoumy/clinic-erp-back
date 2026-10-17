import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { StockTransactionTypeEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /inventory/movements — audit trail of stock changes.
 */
export class QueryStockMovementsDto extends PaginationQueryDto {
  /** Restrict results to a single inventory item. */
  @IsOptional()
  @IsUUID()
  inventoryItemId?: string;

  /** Restrict results to a single location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;

  /** Restrict results to a single transaction type. */
  @IsOptional()
  @IsEnum(StockTransactionTypeEnum)
  type?: StockTransactionTypeEnum;
}
