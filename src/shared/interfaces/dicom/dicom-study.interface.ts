import type { DicomModalityEnum, DicomStudyStatusEnum } from '@/shared/enums';

/**
 * Represents a DICOM study returned from PACS or local storage.
 */
export interface IDicomStudy {
  modalities: DicomModalityEnum[];
  numberOfInstances: number;
  numberOfSeries: number;
  patientId: string;
  patientName: string;
  status: DicomStudyStatusEnum;
  studyDate: string;
  studyDescription: string;
  studyInstanceUid: string;
}
