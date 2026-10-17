import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { ProviderTypeEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /providers.
 */
export class QueryProvidersDto extends PaginationQueryDto {
  /** Filter to providers assigned to a specific department. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  /** Filter to a specific clinical provider classification. */
  @IsOptional()
  @IsEnum(ProviderTypeEnum)
  providerType?: ProviderTypeEnum;
}
