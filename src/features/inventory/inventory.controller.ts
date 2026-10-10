import { Controller } from '@nestjs/common';
import { InventoryService } from './inventory.service';

/** Handles HTTP requests for the inventory feature. */
@Controller('inventory')
export class InventoryController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly inventoryService: InventoryService) {}
}
