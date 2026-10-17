import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateEncounterDto } from './create-encounter.dto';

/**
 * Body for PATCH /encounters/:id. Valid only while the encounter is unsigned; patientId is immutable.
 */
export class UpdateEncounterDto extends PartialType(
  OmitType(CreateEncounterDto, ['patientId']),
) {}
