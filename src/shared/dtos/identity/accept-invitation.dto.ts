import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Body for POST /users/invitations/:token/accept.
 */
export class AcceptInvitationDto {
  /** Password the invitee sets for the newly activated account. */
  @IsString()
  @MinLength(8)
  password!: string;

  /** Optional first name supplied by the invitee on acceptance. */
  @IsOptional()
  @IsString()
  firstName?: string;

  /** Optional last name supplied by the invitee on acceptance. */
  @IsOptional()
  @IsString()
  lastName?: string;
}
