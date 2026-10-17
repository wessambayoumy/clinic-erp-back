import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { ResourceTypeEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /resources.
 */
export class QueryResourcesDto extends PaginationQueryDto {
  /** Restrict results to a single location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;

  /** Restrict results to a single resource kind. */
  @IsOptional()
  @IsEnum(ResourceTypeEnum)
  type?: ResourceTypeEnum;
}
