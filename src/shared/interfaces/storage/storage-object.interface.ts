import type { Readable } from 'node:stream';

/** A downloaded object stream. Content type comes from the database row, not storage. */
export interface IStorageObject {
  body: Readable;
  contentLength: number | undefined;
}
