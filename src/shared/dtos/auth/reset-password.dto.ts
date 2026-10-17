import { IsString, MinLength } from 'class-validator';

/**
 * Body for POST /auth/reset-password.
 */
export class ResetPasswordDto {
  /** Single-use token issued by the forgot-password flow. */
  @IsString()
  token!: string;

  /** New password to set; must be at least 8 characters long. */
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
