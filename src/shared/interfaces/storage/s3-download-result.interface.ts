import type { Readable } from 'node:stream';

/**
 * Result of `S3Service.download`. Wrap `stream` in a `StreamableFile` in the controller.
 */
export interface IS3DownloadResult {
  readonly stream: Readable;
  readonly mimeType: string;
  readonly size?: number;
  readonly originalFilename?: string;
}
