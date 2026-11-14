import { IsString } from 'class-validator';

/**
 * Body for POST /invoices/:id/void.
 */
export class VoidInvoiceDto {
  /** Reason the invoice is being voided. */
  @IsString()
  reason!: string;
}
