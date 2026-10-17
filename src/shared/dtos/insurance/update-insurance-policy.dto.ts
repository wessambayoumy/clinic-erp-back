import { PartialType } from '@nestjs/mapped-types';

import { CreateInsurancePolicyDto } from './create-insurance-policy.dto';

/**
 * Body for PATCH /patients/:id/insurance/:policyId.
 */
export class UpdateInsurancePolicyDto extends PartialType(
  CreateInsurancePolicyDto,
) {}
