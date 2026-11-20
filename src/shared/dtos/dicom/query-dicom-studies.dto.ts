import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { DicomModalityEnum } from '@/shared/enums';

/**
 * DTO for querying DICOM studies with mandatory pagination bounds.
 */
export class QueryDicomStudiesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsEnum(DicomModalityEnum)
  modality?: DicomModalityEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: 'studyDate must be in YYYYMMDD format' })
  studyDate?: string;
}
