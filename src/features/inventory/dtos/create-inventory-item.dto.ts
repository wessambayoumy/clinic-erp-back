import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Body for POST /inventory/items.
 */
export class CreateInventoryItemDto {
  /** Stock-keeping unit code that uniquely identifies the item. */
  @IsString()
  sku!: string;

  /** Human-readable item name. */
  @IsString()
  name!: string;

  /** Unit of measure in which the item is stocked. */
  @IsString()
  unit!: string;

  /** Quantity at or below which a low-stock alert is raised. */
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderThreshold?: number;
}
