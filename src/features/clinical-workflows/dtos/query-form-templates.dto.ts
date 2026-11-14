import { IsOptional, IsString, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '@shared/dtos/shared';

/**
 * Query params for GET /form-templates.
 */
export class QueryFormTemplatesDto extends PaginationQueryDto {
  /** Restrict results to a single department. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  /** Restrict results to a single specialty code. */
  @IsOptional()
  @IsString()
  specialtyCode?: string;
}
