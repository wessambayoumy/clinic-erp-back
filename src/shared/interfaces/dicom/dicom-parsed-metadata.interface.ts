import type { DicomModalityEnum } from '@/shared/enums';

/**
 * Core metadata extracted from a DICOM Part 10 binary file.
 */
export interface IDicomParsedMetadata {
  modality: DicomModalityEnum;
  patientId: string;
  patientName: string;
  seriesInstanceUid: string;
  sopInstanceUid: string;
  studyDate: string;
  studyDescription: string;
  studyInstanceUid: string;
  transferSyntaxUid: string;
}
