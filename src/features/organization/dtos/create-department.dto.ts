import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Body for POST /departments.
 */
export class CreateDepartmentDto {
  /** Location the department belongs to. */
  @IsUUID()
  locationId!: string;

  /** Department display name. */
  @IsString()
  name!: string;

  /** Optional specialty code used to route clinical workflows. */
  @IsOptional()
  @IsString()
  specialtyCode?: string;

  /** Whether the department is shared across every location. */
  @IsOptional()
  @IsBoolean()
  isSharedAcrossLocations?: boolean;
}
