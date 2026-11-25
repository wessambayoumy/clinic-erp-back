import { CreateInsurancePolicyDto } from './create-insurance-policy.dto';
import { PartialType } from '@nestjs/swagger';

/**
 * Body for PATCH /patients/:id/insurance/:policyId.
 */
export class UpdateInsurancePolicyDto extends PartialType(
  CreateInsurancePolicyDto,
) {}
