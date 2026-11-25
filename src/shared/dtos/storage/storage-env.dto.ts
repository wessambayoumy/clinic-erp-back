import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, IsUrl, Min } from 'class-validator';

/** Environment variables required by StorageService. Merge into the global env validation. */
export class StorageEnvDto {
  @IsUrl({ require_tld: false })
  STORAGE_ENDPOINT!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_REGION!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_BUCKET!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_ACCESS_KEY_ID!: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_SECRET_ACCESS_KEY!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  STORAGE_MAX_UPLOAD_BYTES!: number;
}
