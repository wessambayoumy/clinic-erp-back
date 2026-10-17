import { IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Body for POST /encounters — open a visit from scratch.
 */
export class CreateEncounterDto {
  /** Patient the encounter belongs to. */
  @IsUUID()
  patientId!: string;

  /** Provider responsible for the encounter. */
  @IsUUID()
  providerId!: string;

  /** Department where the encounter takes place. */
  @IsUUID()
  departmentId!: string;

  /** Physical location where the encounter takes place. */
  @IsUUID()
  locationId!: string;

  /** Appointment this encounter originates from, when booked in advance. */
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  /** Patient-reported reason for the visit. */
  @IsOptional()
  @IsString()
  chiefComplaint?: string;
}
