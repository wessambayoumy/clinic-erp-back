import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /encounters/:id/diagnoses.
 */
export class CreateDiagnosisDto {
  /** ICD-10 code for the diagnosis. */
  @IsString()
  icd10Code!: string;

  /** Human-readable diagnosis description. */
  @IsString()
  description!: string;

  /** Whether this is the encounter's primary diagnosis. */
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
