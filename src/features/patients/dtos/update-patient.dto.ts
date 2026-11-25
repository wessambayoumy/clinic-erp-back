import { PartialType } from '@nestjs/swagger';

import { CreatePatientDto } from './create-patient.dto';

/**
 * Body for PATCH /patients/:id.
 */
export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
