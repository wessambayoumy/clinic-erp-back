import { IsEnum, IsOptional } from 'class-validator';

import { EligibilityStatusEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /patients/:id/eligibility.
 */
export class QueryEligibilityChecksDto extends PaginationQueryDto {
  /** Filter checks by their current verification status. */
  @IsOptional()
  @IsEnum(EligibilityStatusEnum)
  status?: EligibilityStatusEnum;
}
