import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Credentials for POST /auth/login.
 */
export class LoginDto {
  /** Email address identifying the account to authenticate. */
  @IsEmail()
  email!: string;

  /** Account password; must be at least 8 characters long. */
  @IsString()
  @MinLength(8)
  password!: string;
}
