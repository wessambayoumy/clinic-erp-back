import { AllowedMimeTypeEnum, StorageFolderEnum } from '@/shared/enums/storage';
import type { Readable } from 'node:stream';


/**
 * Input for `S3Service.upload`.
 */
export interface IUploadFileOptions {
  /** The raw file stream (e.g. `file.file` from `@fastify/multipart`). */
  readonly stream: Readable;
  /** Tenant owning the file. Must be a UUID. Becomes the first segment of the object key. */
  readonly organizationId: string;
  readonly folder: StorageFolderEnum;
  /** MIME type declared by the client. Validated against the allow-list and the file's magic bytes. */
  readonly mimeType: string;
  /** Client-supplied filename. Stored as metadata only, never used in the object key. */
  readonly originalFilename: string;
  /** Narrows the global allow-list for this call (e.g. avatars: images only). */
  readonly allowedMimeTypes?: readonly AllowedMimeTypeEnum[];
  /** Overrides the configured default size ceiling. */
  readonly maxSizeBytes?: number;
}
