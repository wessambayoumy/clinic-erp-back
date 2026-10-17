import { IsArray, IsDateString, IsOptional, IsUUID } from 'class-validator';

/**
 * Body for POST /appointments/:id/reschedule — moves the appointment to a new slot atomically, re-running conflict checks.
 */
export class RescheduleAppointmentDto {
  /** New scheduled start of the appointment, as an ISO-8601 string. */
  @IsDateString()
  startAt!: string;

  /** New scheduled end of the appointment, as an ISO-8601 string. */
  @IsDateString()
  endAt!: string;

  /** Identifiers of additional resources to reserve for the new slot. */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  resourceIds?: string[];
}
