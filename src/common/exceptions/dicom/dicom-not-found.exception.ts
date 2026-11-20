import { NotFoundException } from '@nestjs/common';

/**
 * Thrown when a requested DICOM study, series, or instance cannot be found.
 */
export class DicomNotFoundException extends NotFoundException {
  /**
   * Creates a new DicomNotFoundException.
   * @param uid Missing DICOM UID.
   */
  constructor(uid: string) {
    super(`DICOM resource not found: ${uid}`);
  }
}
