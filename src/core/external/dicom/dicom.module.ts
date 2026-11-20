import { Global, Module } from '@nestjs/common';

import { DicomParserService, DicomService, DicomWebService } from './services';

/**
 * Provides DICOM Part 10 parsing and DICOMweb PACS integration.
 */
@Module({
  providers: [
    DicomParserService,
    DicomWebService,
    DicomService,
  ],
  exports: [DicomService, DicomParserService],
})
@Global()
export class DicomModule {}
