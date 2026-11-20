import { IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * DTO accompanying a DICOM file upload request.
 */
export class UploadDicomStudyDto {
  @IsOptional()
  @IsUUID()
  encounterId?: string;

  @IsOptional()
  @IsString()
  patientIdOverride?: string;
}
