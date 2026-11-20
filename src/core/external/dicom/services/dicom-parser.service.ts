import { Injectable } from '@nestjs/common';

import { DicomParseException } from '@/common/exceptions';
import { DicomModalityEnum } from '@/shared/enums';
import type { IDicomParsedMetadata } from '@/shared/interfaces';

const DICOM_PREAMBLE_BYTES = 128;
const DICOM_MAGIC = 'DICM';
const LONG_VR_SET = new Set(['OB', 'OD', 'OF', 'OL', 'OW', 'SQ', 'UC', 'UN', 'UR', 'UT']);

/**
 * Parses and validates DICOM Part 10 binary buffers.
 */
@Injectable()
export class DicomParserService {
  /**
   * Validates the DICOM preamble and extracts core study/patient tags.
   * @param buffer Raw uploaded `.dcm` buffer.
   * @returns Parsed metadata contract.
   */
  public parse(buffer: Buffer): IDicomParsedMetadata {
    if (buffer.length < DICOM_PREAMBLE_BYTES + 4) {
      throw new DicomParseException('File is smaller than DICOM preamble');
    }

    const magic = buffer.subarray(DICOM_PREAMBLE_BYTES, DICOM_PREAMBLE_BYTES + 4).toString('ascii');
    if (magic !== DICOM_MAGIC) {
      throw new DicomParseException('Missing DICM magic header');
    }

    const tags = this.extractTags(buffer, DICOM_PREAMBLE_BYTES + 4);
    const studyInstanceUid = tags.get('0020000D') ?? '';
    const seriesInstanceUid = tags.get('0020000E') ?? '';
    const sopInstanceUid = tags.get('00080018') ?? '';

    if (!studyInstanceUid || !sopInstanceUid) {
      throw new DicomParseException('Missing required StudyInstanceUID or SOPInstanceUID');
    }

    return {
      modality: this.resolveModality(tags.get('00080060')),
      patientId: tags.get('00100020') ?? '',
      patientName: tags.get('00100010') ?? '',
      seriesInstanceUid,
      sopInstanceUid,
      studyDate: tags.get('00080020') ?? '',
      studyDescription: tags.get('00081030') ?? '',
      studyInstanceUid,
      transferSyntaxUid: tags.get('00020010') ?? '',
    };
  }

  private extractTags(buffer: Buffer, startOffset: number): Map<string, string> {
    const tags = new Map<string, string>();
    let offset = startOffset;

    while (offset + 8 <= buffer.length) {
      const group = buffer.readUInt16LE(offset);
      const element = buffer.readUInt16LE(offset + 2);
      if (group > 0x0028) {
        break;
      }

      const vr = buffer.subarray(offset + 4, offset + 6).toString('ascii');
      const header = this.readValueLength(buffer, offset, vr);
      if (!header || header.dataStart + header.length > buffer.length) {
        break;
      }

      const key = `${group.toString(16).padStart(4, '0')}${element.toString(16).padStart(4, '0')}`.toUpperCase();
      const rawValue = buffer.subarray(header.dataStart, header.dataStart + header.length).toString('utf8').replace(/\0/g, '').trim();
      tags.set(key, rawValue);
      offset = header.dataStart + header.length;
    }

    return tags;
  }

  private readValueLength(
    buffer: Buffer,
    offset: number,
    vr: string,
  ): { dataStart: number; length: number } | null {
    if (!/^[A-Z]{2}$/.test(vr)) {
      const implicitLength = buffer.readUInt32LE(offset + 4);
      return implicitLength === 0xffffffff ? null : { dataStart: offset + 8, length: implicitLength };
    }

    if (LONG_VR_SET.has(vr)) {
      if (offset + 12 > buffer.length) {
        return null;
      }
      const longLength = buffer.readUInt32LE(offset + 8);
      return longLength === 0xffffffff ? null : { dataStart: offset + 12, length: longLength };
    }

    const shortLength = buffer.readUInt16LE(offset + 6);
    return { dataStart: offset + 8, length: shortLength };
  }

  private resolveModality(raw?: string): DicomModalityEnum {
    const normalized = (raw ?? '').trim().toUpperCase();
    const values = Object.values(DicomModalityEnum) as string[];
    return values.includes(normalized) ? (normalized as DicomModalityEnum) : DicomModalityEnum.OT;
  }
}
