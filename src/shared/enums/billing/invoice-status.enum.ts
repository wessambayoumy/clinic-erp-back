/**
 * Lifecycle status of an invoice.
 */
export enum InvoiceStatusEnum {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  VOID = 'void',
  WRITTEN_OFF = 'written_off',
}
