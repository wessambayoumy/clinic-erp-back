import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /departments.
 */
export class QueryDepartmentsDto extends PaginationQueryDto {
  /** Filter departments by location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;
}
