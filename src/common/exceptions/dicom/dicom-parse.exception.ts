import { BadRequestException } from '@nestjs/common';

/**
 * Thrown when an uploaded buffer is not a valid DICOM Part 10 file.
 */
export class DicomParseException extends BadRequestException {
  /**
   * Creates a new DicomParseException.
   * @param reason Human-readable parse failure reason.
   */
  constructor(reason: string) {
    super(`Invalid DICOM file: ${reason}`);
  }
}
