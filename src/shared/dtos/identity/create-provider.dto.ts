import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ProviderTypeEnum } from '../../enums';

/**
 * Body for POST /providers — the clinical profile layered on a user.
 */
export class CreateProviderDto {
  /** User account this clinical profile belongs to. */
  @IsUUID()
  userId!: string;

  /** Department the clinical profile is primarily assigned to. */
  @IsUUID()
  departmentId!: string;

  /** Clinical provider classification. */
  @IsEnum(ProviderTypeEnum)
  providerType!: ProviderTypeEnum;

  /** Optional state licence number. */
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  /** Optional national provider identifier (NPI) number. */
  @IsOptional()
  @IsString()
  npiNumber?: string;
}
