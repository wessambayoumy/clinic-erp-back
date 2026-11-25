import { PartialType } from '@nestjs/swagger';

import { CreateTreatmentPlanDto } from './create-treatment-plan.dto';

/**
 * Body for PATCH .../treatment-plans/:planId.
 */
export class UpdateTreatmentPlanDto extends PartialType(
  CreateTreatmentPlanDto,
) {}
