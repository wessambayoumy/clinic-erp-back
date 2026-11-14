import { IsInt, IsUUID, Min } from 'class-validator';

/**
 * One line item nested inside CreatePurchaseOrderDto.
 */
export class PurchaseOrderItemDto {
  /** Inventory item being ordered. */
  @IsUUID()
  inventoryItemId!: string;

  /** Quantity of the item being ordered. */
  @IsInt()
  @Min(1)
  quantity!: number;

  /** Unit cost of the item, in cents. */
  @IsInt()
  @Min(0)
  unitCostCents!: number;
}
