import { IsEmail, IsUUID } from 'class-validator';

/**
 * Body for POST /auth/forgot-password.
 */
export class ForgotPasswordDto {
  /** Clinic organization that owns the account. */
  @IsUUID()
  organizationId!: string;

  /** Active clinic location for tenant-scoped lookup. */
  @IsUUID()
  locationId!: string;

  /** Email address of the account whose password reset is requested. */
  @IsEmail()
  email!: string;
}
