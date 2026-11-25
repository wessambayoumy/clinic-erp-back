import { PartialType } from '@nestjs/swagger';

import { CreateServiceDto } from './create-service.dto';

/**
 * Body for PATCH /services/:id.
 */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
