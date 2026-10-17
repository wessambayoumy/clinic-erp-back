/**
 * Delivery status of a fax message.
 */
export enum FaxStatusEnum {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RECEIVED = 'received',
}
