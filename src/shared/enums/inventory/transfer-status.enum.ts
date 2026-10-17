/**
 * Lifecycle status of a stock transfer between locations.
 */
export enum TransferStatusEnum {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}
