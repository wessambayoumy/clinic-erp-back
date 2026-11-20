/**
 * Lifecycle status of a DICOM study in the clinic pipeline.
 */
export enum DicomStudyStatusEnum {
  FAILED = 'failed',
  INGESTED = 'ingested',
  PENDING = 'pending',
  SYNCED = 'synced',
}
