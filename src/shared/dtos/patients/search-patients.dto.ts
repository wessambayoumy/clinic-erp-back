import { IsString } from 'class-validator';

import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /patients/search — fast pg_trgm lookup by name, phone, or ID.
 */
export class SearchPatientsDto extends PaginationQueryDto {
  /** Lookup term matched against name, phone, or ID. */
  @IsString()
  q!: string;
}
