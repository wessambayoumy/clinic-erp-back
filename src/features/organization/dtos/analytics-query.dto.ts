import { IsISO8601, IsOptional, IsUUID } from 'class-validator';

/**
 * Shared query params for every /analytics/* endpoint
 * (`?from&to&locationId&departmentId`), scoped by CASL to the caller's
 * hierarchy level.
 */
export class AnalyticsQueryDto {
  /** Inclusive lower bound of the reporting window, as an ISO-8601 string. */
  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Inclusive upper bound of the reporting window, as an ISO-8601 string. */
  @IsOptional()
  @IsISO8601()
  to?: string;

  /** Restrict results to a single location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;

  /** Restrict results to a single department. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
