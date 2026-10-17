import { IsISO8601, IsOptional } from 'class-validator';

/**
 * Shared `from`/`to` ISO-8601 date-range query parameters.
 */
export class DateRangeQueryDto {
  /** Inclusive lower bound of the range, as an ISO-8601 string. */
  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Inclusive upper bound of the range, as an ISO-8601 string. */
  @IsOptional()
  @IsISO8601()
  to?: string;
}
