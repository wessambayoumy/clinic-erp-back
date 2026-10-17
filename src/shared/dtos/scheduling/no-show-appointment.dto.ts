import { IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /appointments/:id/no-show.
 */
export class NoShowAppointmentDto {
  /** Optional staff notes about the missed appointment. */
  @IsOptional()
  @IsString()
  notes?: string;
}
