import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '@shared/dtos/shared';

/**
 * Query params for GET /services.
 */
export class QueryServicesDto extends PaginationQueryDto {
  /** Restrict results to a single department. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
