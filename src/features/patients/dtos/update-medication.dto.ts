import { PartialType } from '@nestjs/swagger';

import { CreateMedicationDto } from './create-medication.dto';

/**
 * Body for PATCH .../medications/:medicationId.
 */
export class UpdateMedicationDto extends PartialType(CreateMedicationDto) {}
