import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Query params for GET /icd10/search — code lookup while documenting.
 */
export class QueryIcd10Dto {
  /** Search term matched against ICD-10 codes and descriptions. */
  @IsString()
  q!: string;

  /** Maximum number of matches to return. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
