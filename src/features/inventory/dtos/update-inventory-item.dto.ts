import { PartialType } from '@nestjs/swagger';

import { CreateInventoryItemDto } from './create-inventory-item.dto';

/**
 * Body for PATCH /inventory/items/:id.
 */
export class UpdateInventoryItemDto extends PartialType(
  CreateInventoryItemDto,
) {}
