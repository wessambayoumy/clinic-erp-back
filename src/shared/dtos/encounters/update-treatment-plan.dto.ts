import { PartialType } from '@nestjs/mapped-types';

import { CreateTreatmentPlanDto } from './create-treatment-plan.dto';

/**
 * Body for PATCH .../treatment-plans/:planId.
 */
export class UpdateTreatmentPlanDto extends PartialType(
  CreateTreatmentPlanDto,
) {}
