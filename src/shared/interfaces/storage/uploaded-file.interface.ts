import { AllowedMimeTypeEnum } from '@/shared/enums/storage';

/**
 * Result of a successful upload. Persist `key` on your entity.
 */
export interface IUploadedFile {
  readonly key: string;
  readonly bucket: string;
  readonly size: number;
  readonly mimeType: AllowedMimeTypeEnum;
  readonly originalFilename: string;
  readonly etag?: string;
}
