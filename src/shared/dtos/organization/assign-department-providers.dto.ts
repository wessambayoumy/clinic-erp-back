import { IsArray, IsUUID } from 'class-validator';

/**
 * Body for PUT /departments/:id/providers.
 */
export class AssignDepartmentProvidersDto {
  /** Providers assigned to the department. */
  @IsArray()
  @IsUUID('4', { each: true })
  providerIds!: string[];
}
