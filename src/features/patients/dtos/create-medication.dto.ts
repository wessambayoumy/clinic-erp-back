import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /patients/:id/medications.
 */
export class CreateMedicationDto {
  /** Name of the medication. */
  @IsString()
  name!: string;

  /** Dosage instructions for the medication. */
  @IsOptional()
  @IsString()
  dosage?: string;

  /** How often the medication is taken. */
  @IsOptional()
  @IsString()
  frequency?: string;

  /** Date the medication regimen starts. */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  /** Date the medication regimen ends. */
  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** Whether the medication is currently active. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
