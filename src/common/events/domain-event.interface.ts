export interface DomainEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  data: Record<string, any>;
  metadata: {
    requestId: string;
    userId: string;
    organizationId: string;
    locationId: string;
    timestamp: Date;
  };
}
