export interface DomainEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  data: Record<string, unknown>;
  metadata: {
    requestId: string;
    userId: string;
    organizationId: string;
    locationId: string;
    timestamp: Date;
  };
}
