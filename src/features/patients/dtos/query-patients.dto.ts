import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { GenderEnum } from '@shared/enums';
import { PaginationQueryDto } from '@shared/dtos/shared';

/**
 * Query params for GET /patients.
 */
export class QueryPatientsDto extends PaginationQueryDto {
  /** Restrict results to patients registered at a single location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;

  /** Restrict results to patients of a single gender. */
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;
}
