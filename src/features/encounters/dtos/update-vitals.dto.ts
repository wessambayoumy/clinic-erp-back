import { IsInt, IsNumber, IsOptional } from 'class-validator';

/**
 * Body for PUT /encounters/:id/vitals.
 */
export class UpdateVitalsDto {
  /** Recorded height in centimetres. */
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  /** Recorded weight in kilograms. */
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  /** Recorded body temperature in degrees Celsius. */
  @IsOptional()
  @IsNumber()
  temperatureC?: number;

  /** Systolic blood pressure in mmHg. */
  @IsOptional()
  @IsInt()
  bloodPressureSystolic?: number;

  /** Diastolic blood pressure in mmHg. */
  @IsOptional()
  @IsInt()
  bloodPressureDiastolic?: number;

  /** Heart rate in beats per minute. */
  @IsOptional()
  @IsInt()
  heartRateBpm?: number;

  /** Respiratory rate in breaths per minute. */
  @IsOptional()
  @IsInt()
  respiratoryRate?: number;

  /** Peripheral oxygen saturation as a percentage. */
  @IsOptional()
  @IsNumber()
  oxygenSaturation?: number;
}
