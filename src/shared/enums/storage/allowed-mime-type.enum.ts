/**
 * MIME types accepted by the storage layer.
 * Every member must have a matching entry in `FILE_SIGNATURES` and `MIME_EXTENSIONS`.
 */
export enum AllowedMimeTypeEnum {
  PDF = 'application/pdf',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  TIFF = 'image/tiff',
  DICOM = 'application/dicom',
}
