import { IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /form-templates — a JSONB-backed dynamic form definition.
 */
export class CreateFormTemplateDto {
  /** Display name of the form template. */
  @IsString()
  name!: string;

  /** Department the template is scoped to, when restricted. */
  @IsOptional()
  @IsString()
  departmentId?: string;

  /** Specialty code the template is intended for. */
  @IsOptional()
  @IsString()
  specialtyCode?: string;

  /** JSON schema describing the dynamic form fields. */
  @IsObject()
  schema!: Record<string, unknown>;
}
