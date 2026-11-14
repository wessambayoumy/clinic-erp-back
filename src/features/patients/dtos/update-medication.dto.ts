import { PartialType } from '@nestjs/mapped-types';

import { CreateMedicationDto } from './create-medication.dto';

/**
 * Body for PATCH .../medications/:medicationId.
 */
export class UpdateMedicationDto extends PartialType(CreateMedicationDto) {}
