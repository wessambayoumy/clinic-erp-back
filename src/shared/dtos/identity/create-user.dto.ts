import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * Body for POST /users — create a staff account within the tenant.
 */
export class CreateUserDto {
  /** Work email address of the staff account. */
  @IsEmail()
  email!: string;

  /** Staff member's first name. */
  @IsString()
  firstName!: string;

  /** Staff member's last name. */
  @IsString()
  lastName!: string;

  /** Optional identifiers of roles to grant at creation time. */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}
