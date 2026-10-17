import { IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /encounters/from-appointment/:appointmentId — patient, provider, department and location are pre-filled from the booking.
 */
export class StartFromAppointmentDto {
  /** Patient-reported reason for the visit. */
  @IsOptional()
  @IsString()
  chiefComplaint?: string;
}
