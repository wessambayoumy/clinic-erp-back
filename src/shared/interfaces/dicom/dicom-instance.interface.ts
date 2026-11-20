/**
 * Represents a single DICOM SOP instance.
 */
export interface IDicomInstance {
  instanceNumber: number;
  sopClassUid: string;
  sopInstanceUid: string;
}
