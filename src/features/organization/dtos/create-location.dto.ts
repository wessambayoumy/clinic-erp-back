import { IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /locations.
 */
export class CreateLocationDto {
  /** Location display name. */
  @IsString()
  name!: string;

  /** First line of the street address. */
  @IsOptional()
  @IsString()
  addressLine1?: string;

  /** City name. */
  @IsOptional()
  @IsString()
  city?: string;

  /** State or province name. */
  @IsOptional()
  @IsString()
  state?: string;

  /** Postal or ZIP code. */
  @IsOptional()
  @IsString()
  postalCode?: string;

  /** Country name. */
  @IsOptional()
  @IsString()
  country?: string;

  /** IANA timezone identifier for the location. */
  @IsOptional()
  @IsString()
  timezone?: string;
}
