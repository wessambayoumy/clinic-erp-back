import type { DicomModalityEnum } from '@/shared/enums';

/**
 * Represents a DICOM series inside a study.
 */
export interface IDicomSeries {
  modality: DicomModalityEnum;
  numberOfInstances: number;
  seriesDescription: string;
  seriesInstanceUid: string;
  seriesNumber: number;
}
