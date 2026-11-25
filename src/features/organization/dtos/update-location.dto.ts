import { PartialType } from '@nestjs/swagger';

import { CreateLocationDto } from './create-location.dto';

/**
 * Body for PATCH /locations/:id.
 */
export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
