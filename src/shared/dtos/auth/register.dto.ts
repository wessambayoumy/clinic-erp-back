import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

/** Body for POST /auth/register. Registration is scoped to a clinic location. */
export class RegisterDto {
  @IsUUID()
  organizationId!: string;

  @IsUUID()
  locationId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;
}
