import type { IDomainEvent } from './domain-event.interface';

export interface IEventPublisher {
  publish(event: IDomainEvent): Promise<void>;
  publishBatch(events: IDomainEvent[]): Promise<void>;
}
