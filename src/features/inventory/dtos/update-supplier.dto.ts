import { PartialType } from '@nestjs/swagger';

import { CreateSupplierDto } from './create-supplier.dto';

/**
 * Body for PATCH /inventory/suppliers/:id.
 */
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
