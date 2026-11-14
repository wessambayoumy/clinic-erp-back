import { IsInt, IsUUID, Min } from 'class-validator';

/**
 * Body for POST /payments/stripe/intent.
 */
export class CreateStripeIntentDto {
  /** Invoice the payment intent is created for. */
  @IsUUID()
  invoiceId!: string;

  /** Amount to charge, in cents. */
  @IsInt()
  @Min(1)
  amountCents!: number;
}
