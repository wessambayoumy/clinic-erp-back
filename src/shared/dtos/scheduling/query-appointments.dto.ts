import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { AppointmentStatusEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /appointments.
 */
export class QueryAppointmentsDto extends PaginationQueryDto {
  /** Filter by the provider running the appointment. */
  @IsOptional()
  @IsUUID()
  providerId?: string;

  /** Filter by the patient booked for the appointment. */
  @IsOptional()
  @IsUUID()
  patientId?: string;

  /** Filter by appointment lifecycle status. */
  @IsOptional()
  @IsEnum(AppointmentStatusEnum)
  status?: AppointmentStatusEnum;

  /** Inclusive lower bound of the appointment start time, as an ISO-8601 string. */
  @IsOptional()
  @IsDateString()
  from?: string;

  /** Inclusive upper bound of the appointment start time, as an ISO-8601 string. */
  @IsOptional()
  @IsDateString()
  to?: string;
}
