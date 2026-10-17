import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

import { PaymentMethodEnum } from '../../enums';

/**
 * Body for POST /invoices/:id/payments.
 */
export class RecordPaymentDto {
  /** Payment method used. */
  @IsEnum(PaymentMethodEnum)
  method!: PaymentMethodEnum;

  /** Amount paid, in cents. */
  @IsInt()
  @Min(1)
  amountCents!: number;

  /** Optional ISO-8601 timestamp at which the payment was made. */
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
