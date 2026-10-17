import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ResourceTypeEnum } from '../../enums';

/**
 * Body for POST /resources — a bookable room or piece of equipment.
 */
export class CreateResourceDto {
  /** Identifier of the location the resource belongs to. */
  @IsUUID()
  locationId!: string;

  /** Identifier of the department that owns the resource. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  /** Kind of resource being created. */
  @IsEnum(ResourceTypeEnum)
  type!: ResourceTypeEnum;

  /** Display name of the resource. */
  @IsString()
  name!: string;

  /** Whether the resource can be booked by any department at the location. */
  @IsOptional()
  @IsBoolean()
  isSharedAcrossDepartments?: boolean;
}
