import { IsObject } from 'class-validator';

/**
 * Body for PATCH /encounters/:id/forms/:submissionId.
 */
export class UpdateFormSubmissionDto {
  /** Updated field values keyed by field name. */
  @IsObject()
  data!: Record<string, unknown>;
}
