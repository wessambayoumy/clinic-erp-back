export interface IRequestContext {
  requestId: string;
  userId?: string;
  organizationId: string;
  locationId: string;
  timestamp: Date;
}
