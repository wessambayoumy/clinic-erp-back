import { BadGatewayException } from '@nestjs/common';

/**
 * Thrown when the external PACS / DICOMweb server is unreachable or returns an error.
 */
export class DicomPacsConnectionException extends BadGatewayException {
  /**
   * Creates a new DicomPacsConnectionException.
   * @param operation DICOMweb operation that failed.
   * @param statusCode Optional HTTP status code from PACS.
   */
  constructor(operation: string, statusCode?: number) {
    const suffix = statusCode ? ` (HTTP ${statusCode})` : '';
    super(`PACS communication failed during ${operation}${suffix}`);
  }
}
