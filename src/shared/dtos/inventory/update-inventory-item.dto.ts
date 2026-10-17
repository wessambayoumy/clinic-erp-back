import { PartialType } from '@nestjs/mapped-types';

import { CreateInventoryItemDto } from './create-inventory-item.dto';

/**
 * Body for PATCH /inventory/items/:id.
 */
export class UpdateInventoryItemDto extends PartialType(
  CreateInventoryItemDto,
) {}
