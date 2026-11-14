import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Body for POST /schedule-blocks — blocks time for leave, holidays, or maintenance. Exactly one of providerId/resourceId is expected; enforce that XOR in the service layer.
 */
export class CreateScheduleBlockDto {
  /** Provider whose time is blocked; mutually exclusive with `resourceId`. */
  @IsOptional()
  @IsUUID()
  providerId?: string;

  /** Resource whose time is blocked; mutually exclusive with `providerId`. */
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  /** Start of the blocked period, as an ISO-8601 string. */
  @IsDateString()
  startAt!: string;

  /** End of the blocked period, as an ISO-8601 string. */
  @IsDateString()
  endAt!: string;

  /** Why the time is blocked (leave, holiday, maintenance, ...). */
  @IsString()
  reason!: string;
}
