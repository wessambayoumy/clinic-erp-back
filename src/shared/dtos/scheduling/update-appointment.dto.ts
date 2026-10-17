import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateAppointmentDto } from './create-appointment.dto';

/**
 * Body for PATCH /appointments/:id. Use /reschedule to move the time slot; patientId is immutable after booking.
 */
export class UpdateAppointmentDto extends PartialType(
  OmitType(CreateAppointmentDto, ['patientId', 'startAt', 'endAt']),
) {}
