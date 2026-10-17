import { IsString, MinLength } from 'class-validator';

/**
 * Body for POST /auth/change-password.
 */
export class ChangePasswordDto {
  /** Caller's current password, used to authorize the change. */
  @IsString()
  oldPassword!: string;

  /** New password to set; must be at least 8 characters long. */
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
