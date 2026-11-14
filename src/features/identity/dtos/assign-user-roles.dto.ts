import { IsArray, IsUUID } from 'class-validator';

/**
 * Body for PUT /users/:id/roles — replaces the user's full role set.
 */
export class AssignUserRolesDto {
  /** Identifiers of the roles to assign to the user. */
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds!: string[];
}
