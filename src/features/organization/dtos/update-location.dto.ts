import { PartialType } from '@nestjs/mapped-types';

import { CreateLocationDto } from './create-location.dto';

/**
 * Body for PATCH /locations/:id.
 */
export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
