import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

import { PurchaseOrderItemDto } from './purchase-order-item.dto';

/**
 * Body for POST /inventory/purchase-orders.
 */
export class CreatePurchaseOrderDto {
  /** Supplier the order is placed with. */
  @IsUUID()
  supplierId!: string;

  /** Line items making up the order. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items!: PurchaseOrderItemDto[];
}
