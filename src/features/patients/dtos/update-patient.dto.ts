import { PartialType } from '@nestjs/mapped-types';

import { CreatePatientDto } from './create-patient.dto';

/**
 * Body for PATCH /patients/:id.
 */
export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
