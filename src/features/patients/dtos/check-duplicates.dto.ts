import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /patients/duplicates/check — run before registration.
 */
export class CheckDuplicatesDto {
  /** First name to match against existing patients. */
  @IsString()
  firstName!: string;

  /** Last name to match against existing patients. */
  @IsString()
  lastName!: string;

  /** Date of birth to match against existing patients. */
  @IsDateString()
  dateOfBirth!: string;

  /** Phone number to match against existing patients. */
  @IsOptional()
  @IsString()
  phone?: string;

  /** Email address to match against existing patients. */
  @IsOptional()
  @IsEmail()
  email?: string;
}
