import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

/**
 * Query params for GET /availability — open slots for a provider given a duration and required resources.
 */
export class QueryAvailabilityDto {
  /** Provider whose open slots are requested. */
  @IsUUID()
  providerId!: string;

  /** Length of the desired appointment slot, in minutes. */
  @Type(() => Number)
  @IsInt()
  @Min(5)
  durationMinutes!: number;

  /** Resources that must be free for the returned slots. */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  resourceIds?: string[];

  /** Inclusive lower bound of the search window, as an ISO-8601 string. */
  @IsOptional()
  @IsDateString()
  from?: string;

  /** Inclusive upper bound of the search window, as an ISO-8601 string. */
  @IsOptional()
  @IsDateString()
  to?: string;
}
