import type { MultipartFile } from '@fastify/multipart';

import type { IS3UploadOneOptions } from './s3-upload-one-options.interface';

/**
 * Options for uploading several files to S3 under the same path.
 */
export interface IS3UploadManyOptions extends Omit<
  IS3UploadOneOptions,
  'file'
> {
  /** Fastify multipart files to upload. */
  files: MultipartFile[];
}
