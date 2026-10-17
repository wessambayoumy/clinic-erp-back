import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /patients/:id/allergies.
 */
export class CreateAllergyDto {
  /** Substance the patient reacts to. */
  @IsString()
  allergen!: string;

  /** Observed reaction to the allergen. */
  @IsOptional()
  @IsString()
  reaction?: string;

  /** Severity of the reaction. */
  @IsOptional()
  @IsString()
  severity?: string;

  /** When the reaction was noted. */
  @IsOptional()
  @IsDateString()
  notedAt?: string;
}
