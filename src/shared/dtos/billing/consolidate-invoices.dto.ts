import { IsArray, IsUUID } from 'class-validator';

/**
 * Body for POST /invoices/consolidate — merge department invoices into one statement.
 */
export class ConsolidateInvoicesDto {
  /** Identifiers of the invoices to merge. */
  @IsArray()
  @IsUUID('4', { each: true })
  invoiceIds!: string[];
}
