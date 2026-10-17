import { IsOptional, IsUUID } from 'class-validator';

/**
 * Shared organizational-hierarchy scope filters (`locationId`/`departmentId`)
 * used by analytics and other cross-cutting read endpoints.
 */
export class ScopeQueryDto {
  /** Restrict results to a single location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;

  /** Restrict results to a single department. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
