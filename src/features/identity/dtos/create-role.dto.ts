import { IsArray, IsString, IsUUID } from 'class-validator';

/**
 * Body for POST /roles — a custom role scoped to the organization.
 */
export class CreateRoleDto {
  /** Display name of the role. */
  @IsString()
  name!: string;

  /** Identifiers of the permissions granted to the role. */
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}
