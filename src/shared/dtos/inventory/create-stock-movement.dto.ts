import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

import { StockTransactionTypeEnum } from '../../enums';

/**
 * Body for POST /inventory/movements — receive, consume, or adjust stock.
 */
export class CreateStockMovementDto {
  /** Inventory item affected by the movement. */
  @IsUUID()
  inventoryItemId!: string;

  /** Location where the movement occurs. */
  @IsUUID()
  locationId!: string;

  /** Kind of ledger transaction being recorded. */
  @IsEnum(StockTransactionTypeEnum)
  type!: StockTransactionTypeEnum;

  /** Quantity affected by the movement. */
  @IsInt()
  quantity!: number;

  /** Free-text reason for the movement. */
  @IsOptional()
  @IsString()
  reason?: string;
}
