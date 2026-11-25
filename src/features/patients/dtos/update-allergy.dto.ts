import { PartialType } from '@nestjs/swagger';

import { CreateAllergyDto } from './create-allergy.dto';

/**
 * Body for PATCH .../allergies/:allergyId.
 */
export class UpdateAllergyDto extends PartialType(CreateAllergyDto) {}
