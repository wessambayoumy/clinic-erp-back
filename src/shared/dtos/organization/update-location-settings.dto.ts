import { IsEnum, IsObject, IsOptional } from 'class-validator';

import { StockPoolTypeEnum } from '../../enums';

/**
 * Body for PATCH /locations/:id/settings — per-location overrides.
 */
export class UpdateLocationSettingsDto {
  /** Inventory pool strategy used by this location. */
  @IsOptional()
  @IsEnum(StockPoolTypeEnum)
  inventoryPoolType?: StockPoolTypeEnum;

  /** Operating-hours overrides for this location. */
  @IsOptional()
  @IsObject()
  hours?: Record<string, unknown>;

  /** Policy overrides for this location. */
  @IsOptional()
  @IsObject()
  policies?: Record<string, unknown>;
}
