export interface RequestContext {
  requestId: string;
  userId?: string;
  organizationId: string;
  locationId: string;
  timestamp: Date;
}
