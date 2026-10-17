import { IsEnum } from 'class-validator';

import { PurchaseOrderStatusEnum } from '../../enums';

/**
 * Body for PATCH /inventory/purchase-orders/:id/status.
 */
export class UpdatePurchaseOrderStatusDto {
  /** New lifecycle status for the purchase order. */
  @IsEnum(PurchaseOrderStatusEnum)
  status!: PurchaseOrderStatusEnum;
}
