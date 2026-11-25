import { PartialType } from '@nestjs/swagger';

import { CreatePayerDto } from './create-payer.dto';

/**
 * Body for PATCH /payers/:id.
 */
export class UpdatePayerDto extends PartialType(CreatePayerDto) {}
