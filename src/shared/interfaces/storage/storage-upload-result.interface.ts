import type { AllowedFileTypeEnum } from '@shared/enums';

/** Result of a successful upload. Persist all three fields on the file row. */
export interface IStorageUploadResult {
  key: string;
  contentType: AllowedFileTypeEnum;
  sizeBytes: number;
}
