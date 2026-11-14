import { IsEmail, IsString, IsUUID, Matches } from 'class-validator';

/** Body for confirming a signup or sign-in email code. */
export class VerifyOtpDto {
  @IsUUID()
  organizationId!: string;

  @IsUUID()
  locationId!: string;

  @IsEmail()
  email!: string;

  @IsUUID()
  challengeId!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
