import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * Body for POST /appointments. Provider and resource conflicts are checked server-side inside a transaction, not here.
 */
export class CreateAppointmentDto {
  /** Identifier of the patient being booked. */
  @IsUUID()
  patientId!: string;

  /** Identifier of the provider who will see the patient. */
  @IsUUID()
  providerId!: string;

  /** Identifier of the department the visit belongs to. */
  @IsUUID()
  departmentId!: string;

  /** Identifier of the location where the visit takes place. */
  @IsUUID()
  locationId!: string;

  /** Scheduled start of the appointment, as an ISO-8601 string. */
  @IsDateString()
  startAt!: string;

  /** Scheduled end of the appointment, as an ISO-8601 string. */
  @IsDateString()
  endAt!: string;

  /** Free-text reason for the visit. */
  @IsOptional()
  @IsString()
  reasonForVisit?: string;

  /** Identifiers of additional resources (rooms, equipment) to reserve. */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  resourceIds?: string[];
}
