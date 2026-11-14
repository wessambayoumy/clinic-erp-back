import { PartialType } from '@nestjs/mapped-types';

import { CreateAllergyDto } from './create-allergy.dto';

/**
 * Body for PATCH .../allergies/:allergyId.
 */
export class UpdateAllergyDto extends PartialType(CreateAllergyDto) {}
