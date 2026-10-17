import { IsEnum, IsObject, IsOptional } from 'class-validator';

import { StockPoolTypeEnum } from '../../enums';

/**
 * Body for PATCH /organization/settings — org-wide policies that cascade down to locations and departments.
 */
export class UpdateOrganizationSettingsDto {
  /** Default inventory pool strategy inherited by locations. */
  @IsOptional()
  @IsEnum(StockPoolTypeEnum)
  defaultInventoryPoolType?: StockPoolTypeEnum;

  /** Organization-wide policies that cascade down to locations and departments. */
  @IsOptional()
  @IsObject()
  cascadePolicies?: Record<string, unknown>;
}
