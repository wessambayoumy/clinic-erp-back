import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

/**
 * Credentials for POST /auth/login.
 */
export class LoginDto {
  /** Clinic organization that owns the account. */
  @IsUUID()
  organizationId!: string;

  /** Active clinic location for the session's tenant context. */
  @IsUUID()
  locationId!: string;

  /** Email address identifying the account to authenticate. */
  @IsEmail()
  email!: string;

  /** Account password; must be at least 8 characters long. */
  @IsString()
  @MinLength(8)
  password!: string;
}
