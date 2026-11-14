import { IsOptional, IsString } from 'class-validator';

/**
 * Body for PATCH /organization — org profile and branding.
 */
export class UpdateOrganizationDto {
  /** Organization display name. */
  @IsOptional()
  @IsString()
  name?: string;

  /** Registered legal name of the organization. */
  @IsOptional()
  @IsString()
  legalName?: string;

  /** Default IANA timezone for the organization. */
  @IsOptional()
  @IsString()
  timezone?: string;
}
