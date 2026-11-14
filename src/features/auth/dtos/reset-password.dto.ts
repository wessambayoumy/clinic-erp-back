import { IsEmail, IsString, IsUUID, Matches, MinLength } from 'class-validator';

/**
 * Body for POST /auth/reset-password.
 */
export class ResetPasswordDto {
  /** Clinic organization that owns the account. */
  @IsUUID()
  organizationId!: string;

  /** Active clinic location for tenant-scoped lookup. */
  @IsUUID()
  locationId!: string;

  /** Email address that received the recovery code. */
  @IsEmail()
  email!: string;

  /** Challenge identifier returned by POST /auth/forgot-password. */
  @IsUUID()
  challengeId!: string;

  /** Six-digit, five-minute password-recovery code. */
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;

  /** New password to set; must be at least 8 characters long. */
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
