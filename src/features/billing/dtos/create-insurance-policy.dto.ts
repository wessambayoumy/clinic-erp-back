import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * Body for POST /patients/:id/insurance.
 */
export class CreateInsurancePolicyDto {
  /** Payer that administers the policy. */
  @IsUUID()
  payerId!: string;

  /** Member identifier assigned by the payer. */
  @IsString()
  memberId!: string;

  /** Employer or plan group number, when the policy belongs to one. */
  @IsOptional()
  @IsString()
  groupNumber?: string;

  /** Whether this policy is the patient's primary coverage. */
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  /** Date the coverage becomes effective, as an ISO date string. */
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  /** Date the coverage ends, as an ISO date string. */
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
