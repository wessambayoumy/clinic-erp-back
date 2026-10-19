import { Transform } from 'node:stream';
import type { TransformCallback } from 'node:stream';

import { BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';

import type { IFileSignature, IUploadGuardOptions } from '@shared/interfaces/storage';
import { FILE_SIGNATURES, SIGNATURE_HEADER_BYTES } from '@/shared/constants/storage';

/**
 * Pass-through stream that guards an upload while it streams to S3:
 *  - rejects files over the size ceiling as soon as the limit is crossed,
 *  - rejects empty files,
 *  - verifies the file's magic bytes against its declared MIME type.
 *
 * The first bytes are held back until the signature is verified, so nothing
 * unverified ever reaches S3. Errors are Nest HTTP exceptions, so they
 * propagate through `Upload.done()` and map directly to HTTP responses.
 */
export class UploadGuardTransform extends Transform {
  private bytesReceived = 0;
  private headerLength = 0;
  private signatureVerified = false;
  private readonly headerChunks: Buffer[] = [];

  /**
   * @param options - Declared MIME type and size ceiling.
   */
  public constructor(private readonly options: IUploadGuardOptions) {
    super();
  }

  /**
   * Total bytes seen so far. Final once the stream has ended.
   */
  public get totalBytes(): number {
    return this.bytesReceived;
  }

  /**
   * Enforces the size limit and holds back the header until it can be verified.
   *
   * @param chunk - Incoming data.
   * @param _encoding - Unused (buffer mode).
   * @param callback - Completion callback.
   */
  public override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.bytesReceived += chunk.length;

    if (this.bytesReceived > this.options.maxSizeBytes) {
      callback(new PayloadTooLargeException(`File exceeds the maximum size of ${this.options.maxSizeBytes} bytes`));
      return;
    }

    if (this.signatureVerified) {
      callback(null, chunk);
      return;
    }

    this.headerChunks.push(chunk);
    this.headerLength += chunk.length;

    if (this.headerLength < SIGNATURE_HEADER_BYTES) {
      callback();
      return;
    }

    this.releaseHeader(callback);
  }

  /**
   * Handles files shorter than the header window and rejects empty files.
   *
   * @param callback - Completion callback.
   */
  public override _flush(callback: TransformCallback): void {
    if (this.bytesReceived === 0) {
      callback(new BadRequestException('Uploaded file is empty'));
      return;
    }

    if (this.signatureVerified) {
      callback();
      return;
    }

    this.releaseHeader(callback);
  }

  /**
   * Verifies the buffered header and, if valid, flushes it downstream.
   *
   * @param callback - Completion callback.
   */
  private releaseHeader(callback: TransformCallback): void {
    const header = Buffer.concat(this.headerChunks, this.headerLength);

    if (!this.matchesDeclaredType(header)) {
      callback(new UnsupportedMediaTypeException('File content does not match its declared type'));
      return;
    }

    this.signatureVerified = true;
    this.headerChunks.length = 0;
    callback(null, header);
  }

  /**
   * Checks whether the header satisfies any known signature for the declared type.
   *
   * @param header - Leading bytes of the file.
   * @returns `true` when the magic bytes match.
   */
  private matchesDeclaredType(header: Buffer): boolean {
    const alternatives = FILE_SIGNATURES.get(this.options.mimeType);

    if (alternatives === undefined) {
      return false;
    }

    return alternatives.some((segments) => segments.every((segment) => this.matchesSegment(header, segment)));
  }

  /**
   * Compares one signature segment against the header.
   *
   * @param header - Leading bytes of the file.
   * @param segment - Expected bytes at a fixed offset.
   * @returns `true` when the segment matches.
   */
  private matchesSegment(header: Buffer, segment: IFileSignature): boolean {
    const end = segment.offset + segment.bytes.length;

    return header.length >= end && header.subarray(segment.offset, end).equals(Buffer.from(segment.bytes));
  }
}
