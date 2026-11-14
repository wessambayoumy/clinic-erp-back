import { IsString } from 'class-validator';

/**
 * Body for POST /appointments/:id/cancel.
 */
export class CancelAppointmentDto {
  /** Why the appointment is being cancelled. */
  @IsString()
  reason!: string;
}
