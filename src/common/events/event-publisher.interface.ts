import { DomainEvent } from './domain-event.interface';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}
