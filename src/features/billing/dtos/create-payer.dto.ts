import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /payers.
 */
export class CreatePayerDto {
  /** Display name of the insurance payer. */
  @IsString()
  name!: string;

  /** Email address to contact the payer at. */
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  /** Phone number to contact the payer at. */
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
