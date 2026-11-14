import { IsEmail, IsOptional, IsUUID } from 'class-validator';

/**
 * Body for POST /users/invitations.
 */
export class InviteUserDto {
  /** Email address the invitation is sent to. */
  @IsEmail()
  email!: string;

  /** Role to grant once the invitation is accepted. */
  @IsUUID()
  roleId!: string;

  /** Optional department the invited user is placed in. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
