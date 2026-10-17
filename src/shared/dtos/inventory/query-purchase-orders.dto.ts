import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PurchaseOrderStatusEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /inventory/purchase-orders.
 */
export class QueryPurchaseOrdersDto extends PaginationQueryDto {
  /** Restrict results to a single supplier. */
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  /** Restrict results to a single purchase-order status. */
  @IsOptional()
  @IsEnum(PurchaseOrderStatusEnum)
  status?: PurchaseOrderStatusEnum;
}
