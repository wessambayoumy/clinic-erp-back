import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { ImagingModalityEnum } from '../../enums';

/**
 * Metadata fields accompanying a DICOM upload for POST /imaging/studies; the study itself is queued to the Python pydicom worker.
 */
export class UploadImagingStudyDto {
  /** Patient the imaging study belongs to. */
  @IsUUID()
  patientId!: string;

  /** Encounter the imaging study is associated with. */
  @IsOptional()
  @IsUUID()
  encounterId?: string;

  /** Imaging modality of the uploaded study. */
  @IsEnum(ImagingModalityEnum)
  modality!: ImagingModalityEnum;

  /** Free-text description of the study. */
  @IsOptional()
  @IsString()
  description?: string;
}
