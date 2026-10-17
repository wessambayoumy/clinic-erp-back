import { IsEnum } from 'class-validator';

import { TransferStatusEnum } from '../../enums';

/**
 * Body for PATCH /inventory/transfers/:id/status.
 */
export class UpdateTransferStatusDto {
  /** New lifecycle status for the transfer. */
  @IsEnum(TransferStatusEnum)
  status!: TransferStatusEnum;
}
