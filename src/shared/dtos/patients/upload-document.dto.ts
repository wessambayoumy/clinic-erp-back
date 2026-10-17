import { IsEnum, IsInt, IsString, Min } from 'class-validator';

import { DocumentCategoryEnum } from '../../enums';

/**
 * Metadata fields accompanying a multipart file upload for POST /patients/:id/documents.
 */
export class UploadDocumentDto {
  /** Category the uploaded document belongs to. */
  @IsEnum(DocumentCategoryEnum)
  category!: DocumentCategoryEnum;

  /** Original file name of the uploaded document. */
  @IsString()
  fileName!: string;

  /** MIME type of the uploaded file. */
  @IsString()
  mimeType!: string;

  /** Size of the uploaded file in bytes. */
  @IsInt()
  @Min(1)
  sizeBytes!: number;
}
