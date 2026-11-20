import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DicomNotFoundException,
  DicomPacsConnectionException,
} from '@/common/exceptions';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { DicomModalityEnum, DicomStudyStatusEnum } from '@/shared/enums';
import type { IDicomQueryOptions, IDicomStudy } from '@/shared/interfaces';

interface IDicomJsonTag {
  Value?: Array<string | number>;
}

type DicomJsonRecordType = Record<string, IDicomJsonTag | undefined>;

/**
 * Low-level DICOMweb (QIDO-RS, WADO-RS, STOW-RS) HTTP client.
 */
@Injectable()
export class DicomWebService {
  private readonly baseUrl: string;
  private readonly authHeader: string | null;
  private readonly timeoutMs: number;

  /**
   * Initializes DICOMweb connection settings from ConfigService.
   * @param configService Application configuration service.
   * @param logger Structured application logger.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('DICOM_WEB_BASE_URL').replace(/\/+$/, '');
    this.timeoutMs = this.configService.get<number>('DICOM_TIMEOUT_MS') ?? 15000;
    const token = this.configService.get<string>('DICOM_AUTH_TOKEN');
    this.authHeader = token ? `Bearer ${token}` : null;
  }

  /**
   * Queries studies via QIDO-RS.
   * @param options Pagination and filter parameters.
   * @returns Matching DICOM studies.
   */
  public async searchStudies(options: IDicomQueryOptions): Promise<IDicomStudy[]> {
    const params = new URLSearchParams({
      limit: String(options.limit),
      offset: String(options.offset),
    });
    if (options.patientId) params.set('PatientID', options.patientId);
    if (options.studyDate) params.set('StudyDate', options.studyDate);
    if (options.modality) params.set('ModalitiesInStudy', options.modality);

    const response = await this.request('QIDO-RS searchStudies', `${this.baseUrl}/studies?${params.toString()}`, {
      headers: { Accept: 'application/dicom+json' },
    });

    if (response.status === 204) {
      return [];
    }

    const records = (await response.json()) as DicomJsonRecordType[];
    return records.map((record) => this.mapStudyRecord(record));
  }

  /**
   * Retrieves a rendered JPEG preview for a specific instance via WADO-RS.
   * @param studyUid StudyInstanceUID.
   * @param seriesUid SeriesInstanceUID.
   * @param sopUid SOPInstanceUID.
   * @returns Binary JPEG buffer.
   */
  public async retrieveRenderedInstance(
    studyUid: string,
    seriesUid: string,
    sopUid: string,
  ): Promise<Buffer> {
    const path = `${this.baseUrl}/studies/${encodeURIComponent(studyUid)}/series/${encodeURIComponent(seriesUid)}/instances/${encodeURIComponent(sopUid)}/rendered`;
    const response = await this.request('WADO-RS retrieveRendered', path, {
      headers: { Accept: 'image/jpeg' },
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Uploads a DICOM Part 10 buffer to PACS via STOW-RS.
   * @param buffer Raw `.dcm` buffer.
   */
  public async storeInstance(buffer: Buffer): Promise<void> {
    const boundary = `dicom-boundary-${Date.now()}`;
    const header = Buffer.from(`--${boundary}\r\nContent-Type: application/dicom\r\n\r\n`, 'utf8');
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const body = Buffer.concat([header, buffer, footer]);

    await this.request('STOW-RS storeInstance', `${this.baseUrl}/studies`, {
      method: 'POST',
      headers: {
        Accept: 'application/dicom+json',
        'Content-Type': `multipart/related; type="application/dicom"; boundary=${boundary}`,
      },
      body,
    });
  }

  private async request(operation: string, url: string, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers);
    if (this.authHeader) {
      headers.set('Authorization', this.authHeader);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error: unknown) {
      this.logger.error(`DICOMweb request error during ${operation}`, error instanceof Error ? error.stack : undefined);
      throw new DicomPacsConnectionException(operation);
    }

    if (response.status === 404) {
      throw new DicomNotFoundException(url);
    }
    if (!response.ok && response.status !== 204) {
      throw new DicomPacsConnectionException(operation, response.status);
    }

    return response;
  }

  private mapStudyRecord(record: DicomJsonRecordType): IDicomStudy {
    const map = new Map(Object.entries(record));
    const readStr = (tag: string): string => String(map.get(tag)?.Value?.[0] ?? '');
    const readNum = (tag: string): number => Number(map.get(tag)?.Value?.[0] ?? 0);
    const rawModalities = map.get('00080061')?.Value ?? [];
    const allowed = Object.values(DicomModalityEnum) as string[];

    return {
      modalities: rawModalities
        .map((m) => String(m).toUpperCase())
        .filter((m): m is DicomModalityEnum => allowed.includes(m)),
      numberOfInstances: readNum('00201208'),
      numberOfSeries: readNum('00201206'),
      patientId: readStr('00100020'),
      patientName: readStr('00100010'),
      status: DicomStudyStatusEnum.SYNCED,
      studyDate: readStr('00080020'),
      studyDescription: readStr('00081030'),
      studyInstanceUid: readStr('0020000D'),
    };
  }
}
