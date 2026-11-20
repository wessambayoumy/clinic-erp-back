import type { DicomModalityEnum } from '@/shared/enums';

/**
 * Paginated QIDO-RS query parameters for searching DICOM studies.
 */
export interface IDicomQueryOptions {
  limit: number;
  modality?: DicomModalityEnum;
  offset: number;
  patientId?: string;
  studyDate?: string;
}
