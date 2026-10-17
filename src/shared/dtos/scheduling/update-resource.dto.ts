import { PartialType } from '@nestjs/mapped-types';

import { CreateResourceDto } from './create-resource.dto';

/**
 * Body for PATCH /resources/:id.
 */
export class UpdateResourceDto extends PartialType(CreateResourceDto) {}
