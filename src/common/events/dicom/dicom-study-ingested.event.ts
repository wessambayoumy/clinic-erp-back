import type { IDicomParsedMetadata } from '@/shared/interfaces';

/**
 * Domain event emitted after a DICOM instance is validated and stored in PACS.
 */
export class DicomStudyIngestedEvent {
  /**
   * Creates a new DicomStudyIngestedEvent.
   * @param metadata Extracted DICOM metadata.
   * @param encounterId Optional linked clinical encounter ID.
   */
  constructor(
    public readonly metadata: IDicomParsedMetadata,
    public readonly encounterId?: string,
  ) {}
}
