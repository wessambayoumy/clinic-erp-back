import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Body for POST /encounters/:id/treatment-plans.
 */
export class CreateTreatmentPlanDto {
  /** Description of the planned treatment. */
  @IsString()
  description!: string;

  /** Procedure code associated with the planned treatment. */
  @IsOptional()
  @IsString()
  procedureCode?: string;

  /** Estimated cost of the treatment plan, in cents. */
  @IsOptional()
  @IsInt()
  @Min(0)
  costCents?: number;
}
