import type { Readable } from 'node:stream';

/** Input for uploading one tenant-scoped object. Ids come from the verified JWT / DB row. */
export interface IStorageUploadInput {
  organizationId: string;
  locationId: string;
  body: Readable;
}
