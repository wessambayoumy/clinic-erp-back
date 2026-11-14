import { IsInt, IsUUID, Min } from 'class-validator';

/**
 * Body for POST /inventory/transfers — move stock between locations.
 */
export class CreateTransferDto {
  /** Inventory item being transferred. */
  @IsUUID()
  inventoryItemId!: string;

  /** Location the stock is transferred from. */
  @IsUUID()
  fromLocationId!: string;

  /** Location the stock is transferred to. */
  @IsUUID()
  toLocationId!: string;

  /** Quantity of stock to transfer. */
  @IsInt()
  @Min(1)
  quantity!: number;
}
