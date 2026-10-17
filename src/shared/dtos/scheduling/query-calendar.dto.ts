import { IsArray, IsDateString, IsOptional, IsUUID } from 'class-validator';

/**
 * Query params for GET /calendar — multi-provider, room and equipment matrix for a date range.
 */
export class QueryCalendarDto {
  /** Inclusive start of the calendar range, as an ISO-8601 string. */
  @IsDateString()
  from!: string;

  /** Inclusive end of the calendar range, as an ISO-8601 string. */
  @IsDateString()
  to!: string;

  /** Restrict the matrix to these providers. */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  providerIds?: string[];

  /** Restrict the matrix to a single location. */
  @IsOptional()
  @IsUUID()
  locationId?: string;

  /** Restrict the matrix to a single department. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
