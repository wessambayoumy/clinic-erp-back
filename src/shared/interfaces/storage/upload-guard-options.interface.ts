import { AllowedMimeTypeEnum } from "@/shared/enums/storage";

/**
 * Options for `UploadGuardTransform`.
 */
export interface IUploadGuardOptions {
  /** MIME type the file claims to be; its magic bytes are verified against it. */
  readonly mimeType: AllowedMimeTypeEnum;
  /** Hard size ceiling in bytes. */
  readonly maxSizeBytes: number;
}
