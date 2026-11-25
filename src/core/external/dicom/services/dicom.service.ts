import { Injectable, StreamableFile } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DicomStudyIngestedEvent } from '@/common/events';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import type {
  IDicomParsedMetadata,
  IDicomQueryOptions,
  IDicomStudy,
} from '@/shared/interfaces';

import { DicomParserService } from './dicom-parser.service';
import { DicomWebService } from './dicom-web.service';

/**
 * High-level DICOM adapter coordinating validation, PACS storage, and retrieval.
 */
@Injectable()
export class DicomService {
  /**
   * Creates a new DicomService.
   * @param parserService Local DICOM binary parser.
   * @param dicomWebService DICOMweb HTTP client.
   * @param eventEmitter Domain event emitter.
   * @param logger Application logger.
   */
  constructor(
    private readonly parserService: DicomParserService,
    private readonly dicomWebService: DicomWebService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Validates, parses, and stores a DICOM file in PACS, then emits an ingestion event.
   * @param buffer Raw `.dcm` buffer.
   * @param encounterId Optional encounter ID to link the study.
   * @returns Extracted DICOM metadata.
   */
  public async ingestFile(
    buffer: Buffer,
    encounterId?: string,
  ): Promise<IDicomParsedMetadata> {
    const metadata = this.parserService.parse(buffer);
    await this.dicomWebService.storeInstance(buffer);

    this.logger.log(
      `Ingested DICOM study ${metadata.studyInstanceUid} (${metadata.modality})`,
    );
    await this.eventEmitter.emitAsync(
      'dicom.study.ingested',
      new DicomStudyIngestedEvent(metadata, encounterId),
    );

    return metadata;
  }

  /**
   * Searches DICOM studies on PACS with pagination.
   * @param options Query filters and pagination bounds.
   * @returns Matching studies.
   */
  public async searchStudies(
    options: IDicomQueryOptions,
  ): Promise<IDicomStudy[]> {
    return this.dicomWebService.searchStudies(options);
  }

  /**
   * Streams a rendered JPEG preview for a DICOM instance.
   * @param studyUid StudyInstanceUID.
   * @param seriesUid SeriesInstanceUID.
   * @param sopUid SOPInstanceUID.
   * @returns NestJS StreamableFile for HTTP streaming.
   */
  public async getPreviewStream(
    studyUid: string,
    seriesUid: string,
    sopUid: string,
  ): Promise<StreamableFile> {
    const jpegBuffer = await this.dicomWebService.retrieveRenderedInstance(
      studyUid,
      seriesUid,
      sopUid,
    );
    return new StreamableFile(jpegBuffer, { type: 'image/jpeg' });
  }
}
