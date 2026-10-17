import { PartialType } from '@nestjs/mapped-types';

import { CreateSupplierDto } from './create-supplier.dto';

/**
 * Body for PATCH /inventory/suppliers/:id.
 */
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
