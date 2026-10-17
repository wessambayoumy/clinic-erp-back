import { PartialType } from '@nestjs/mapped-types';

import { CreateServiceDto } from './create-service.dto';

/**
 * Body for PATCH /services/:id.
 */
export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
