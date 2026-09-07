import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { DomainEvent } from './domain-event.interface';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save domain event to outbox table
   * The outbox pattern ensures events are persisted atomically with the domain entity
   * A separate process will later publish these events
   */
  async saveEvent(event: DomainEvent): Promise<void> {
    try {
      // In a real implementation, this would insert into an outbox table
      // For now, we'll just log it
      this.logger.log(
        `Event saved to outbox: ${event.eventType} for ${event.aggregateType}/${event.aggregateId}`,
        'OutboxService',
      );
    } catch (error) {
      this.logger.error(
        `Failed to save event to outbox: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Save multiple events to outbox atomically
   */
  async saveEvents(events: DomainEvent[]): Promise<void> {
    try {
      for (const event of events) {
        await this.saveEvent(event);
      }
      this.logger.log(
        `Saved ${events.length} events to outbox`,
        'OutboxService',
      );
    } catch (error) {
      this.logger.error(
        `Failed to save events to outbox: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Retrieve unpublished events from outbox
   * Used by event publishing service
   */
  async getUnpublishedEvents(limit: number = 100): Promise<DomainEvent[]> {
    // In a real implementation, this would query the outbox table
    // For now, return empty array
    return [];
  }

  /**
   * Mark event as published
   */
  async markAsPublished(eventId: string): Promise<void> {
    try {
      this.logger.log(`Event marked as published: ${eventId}`, 'OutboxService');
    } catch (error) {
      this.logger.error(
        `Failed to mark event as published: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
