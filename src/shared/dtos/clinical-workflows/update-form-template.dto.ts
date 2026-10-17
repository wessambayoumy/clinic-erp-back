import { PartialType } from '@nestjs/mapped-types';

import { CreateFormTemplateDto } from './create-form-template.dto';

/**
 * Body for PATCH /form-templates/:id. Publishing (POST .../publish) freezes the current draft into a new version rather than mutating it.
 */
export class UpdateFormTemplateDto extends PartialType(CreateFormTemplateDto) {}
