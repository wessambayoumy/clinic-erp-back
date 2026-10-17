import { IsEmail } from 'class-validator';

/**
 * Body for POST /auth/forgot-password.
 */
export class ForgotPasswordDto {
  /** Email address of the account whose password reset is requested. */
  @IsEmail()
  email!: string;
}
