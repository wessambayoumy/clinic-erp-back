import { IsObject, IsUUID } from 'class-validator';

/**
 * Body for POST /encounters/:id/forms — fill a form inside an encounter.
 */
export class SubmitFormDto {
  /** Form template being filled in. */
  @IsUUID()
  formTemplateId!: string;

  /** Submitted field values keyed by field name. */
  @IsObject()
  data!: Record<string, unknown>;
}
