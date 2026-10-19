import { StorageFolderEnum } from '@/shared/enums/storage';
import type { MultipartFile } from '@fastify/multipart';

/**
 * Options for uploading a single file to S3.
 */
export interface IS3UploadOneOptions {
  /** Fastify multipart file (buffered with `toBuffer()` or streamed via `file`). */
  file: MultipartFile;
  /** Logical folder path inside the app namespace (e.g. `patients/documents`). */
  path: string;
  /** Trusted content type override. Preferred over the client-supplied mimetype. */
  contentType?: string;
  /** `MEMORY` buffers the file first; anything else streams it. Defaults to `MEMORY`. */
  storageType?: StorageFolderEnum;
}
