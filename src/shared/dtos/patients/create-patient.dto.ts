import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { GenderEnum } from '../../enums';

/**
 * Body for POST /patients — register a new patient.
 */
export class CreatePatientDto {
  /** Patient's first name. */
  @IsString()
  firstName!: string;

  /** Patient's last name. */
  @IsString()
  lastName!: string;

  /** Patient's date of birth. */
  @IsDateString()
  dateOfBirth!: string;

  /** Patient's gender. */
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  /** Patient's email address. */
  @IsOptional()
  @IsEmail()
  email?: string;

  /** Patient's phone number. */
  @IsOptional()
  @IsString()
  phone?: string;

  /** First line of the patient's address. */
  @IsOptional()
  @IsString()
  addressLine1?: string;

  /** City of the patient's address. */
  @IsOptional()
  @IsString()
  city?: string;

  /** State or province of the patient's address. */
  @IsOptional()
  @IsString()
  state?: string;

  /** Postal code of the patient's address. */
  @IsOptional()
  @IsString()
  postalCode?: string;

  /** Country of the patient's address. */
  @IsOptional()
  @IsString()
  country?: string;

  /** Primary location the patient is registered at. */
  @IsOptional()
  @IsUUID()
  primaryLocationId?: string;
}
