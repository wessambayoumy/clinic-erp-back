import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import type { IDomainEvent } from '@/shared/interfaces/events';
import type { PrismaTransaction } from '@/shared/types';

const OUTBOX_BATCH_SIZE = 100;

/** Persists domain events and publishes pending events to the local event bus. */
@Injectable()
export class OutboxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
  ) {}

  /** Persists an event, optionally inside the caller's domain transaction. */
  public async saveEvent(
    event: IDomainEvent,
    transaction?: PrismaTransaction,
  ): Promise<void> {
    await this.persistEvent(event, transaction);
  }

  /** Persists a batch atomically or inside the caller's transaction. */
  public async saveEvents(
    events: IDomainEvent[],
    transaction?: PrismaTransaction,
  ): Promise<void> {
    if (transaction) {
      for (const event of events) {
        await this.persistEvent(event, transaction);
      }
      return;
    }

    await this.prisma.client.transaction(async (tx): Promise<void> => {
      for (const event of events) {
        await this.persistEvent(event, tx);
      }
    });
  }

  /** Returns a bounded list of events that have not been published yet. */
  public async getUnpublishedEvents(
    limit = OUTBOX_BATCH_SIZE,
  ): Promise<IDomainEvent[]> {
    const boundedLimit = Math.max(1, Math.min(limit, OUTBOX_BATCH_SIZE));
    const plan = this.prisma.client.raw.sql`
      SELECT "id", "aggregateId", "aggregateType", "eventType", "data", "metadata"
      FROM "outbox_events"
      WHERE "publishedAt" IS NULL
      ORDER BY "createdAt" ASC
      LIMIT ${boundedLimit}
    `
      .returnsRow({
        id: 'pg/uuid@1',
        aggregateId: 'pg/text@1',
        aggregateType: 'pg/text@1',
        eventType: 'pg/text@1',
        data: 'pg/json@1',
        metadata: 'pg/json@1',
      })
      .build();

    const events: IDomainEvent[] = [];
    for await (const row of this.prisma.client.runtime().query(plan)) {
      events.push(this.toDomainEvent(row));
    }
    return events;
  }

  /** Marks an outbox record as successfully published. */
  public async markAsPublished(eventId: string): Promise<void> {
    const plan = this.prisma.client.raw.sql`
      UPDATE "outbox_events"
      SET "publishedAt" = NOW(), "lockedAt" = NULL
      WHERE "id" = ${eventId}::uuid
    `
      .affectedCount()
      .build();
    await this.prisma.client.runtime().execute(plan);
  }

  /** Claims and publishes a batch of persisted events every five seconds. */
  @Cron('*/5 * * * * *', { waitForCompletion: true })
  public async publishPendingEvents(): Promise<void> {
    try {
      const events = await this.claimPendingEvents();
      for (const event of events) {
        try {
          await this.eventEmitter.emitAsync(event.eventType, event);
          await this.markAsPublished(event.id);
        } catch (error: unknown) {
          await this.releaseEvent(event.id);
          this.logger.error(
            `Outbox publish failed for ${event.id}: ${this.errorMessage(error)}`,
          );
        }
      }
    } catch (error: unknown) {
      this.logger.error(`Outbox polling failed: ${this.errorMessage(error)}`);
    }
  }

  private async persistEvent(
    event: IDomainEvent,
    transaction?: PrismaTransaction,
  ): Promise<void> {
    const plan = this.prisma.client.raw.sql`
      INSERT INTO "outbox_events" (
        "id", "aggregateId", "aggregateType", "eventType", "data", "metadata"
      ) VALUES (
        ${event.id}::uuid,
        ${event.aggregateId},
        ${event.aggregateType},
        ${event.eventType},
        ${JSON.stringify(event.data)}::jsonb,
        ${JSON.stringify(event.metadata)}::jsonb
      )
    `
      .affectedCount()
      .build();

    if (transaction) {
      await transaction.execute(plan);
      return;
    }
    await this.prisma.client.runtime().execute(plan);
  }

  private async claimPendingEvents(): Promise<IDomainEvent[]> {
    const plan = this.prisma.client.raw.sql`
      WITH candidates AS (
        SELECT "id"
        FROM "outbox_events"
        WHERE "publishedAt" IS NULL
          AND ("lockedAt" IS NULL OR "lockedAt" < NOW() - INTERVAL '1 minute')
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT ${OUTBOX_BATCH_SIZE}
      )
      UPDATE "outbox_events" AS events
      SET "lockedAt" = NOW(), "attempts" = events."attempts" + 1
      FROM candidates
      WHERE events."id" = candidates."id"
      RETURNING events."id", events."aggregateId", events."aggregateType",
        events."eventType", events."data", events."metadata"
    `
      .returnsRow({
        id: 'pg/uuid@1',
        aggregateId: 'pg/text@1',
        aggregateType: 'pg/text@1',
        eventType: 'pg/text@1',
        data: 'pg/json@1',
        metadata: 'pg/json@1',
      })
      .build();

    const events: IDomainEvent[] = [];
    for await (const row of this.prisma.client.runtime().query(plan)) {
      events.push(this.toDomainEvent(row));
    }
    return events;
  }

  private async releaseEvent(eventId: string): Promise<void> {
    const plan = this.prisma.client.raw.sql`
      UPDATE "outbox_events"
      SET "lockedAt" = NULL
      WHERE "id" = ${eventId}::uuid AND "publishedAt" IS NULL
    `
      .affectedCount()
      .build();
    await this.prisma.client.runtime().execute(plan);
  }

  private toDomainEvent(row: {
    id: string;
    aggregateId: string;
    aggregateType: string;
    eventType: string;
    data: unknown;
    metadata: unknown;
  }): IDomainEvent {
    const data = this.asRecord(row.data);
    const metadata = this.asRecord(row.metadata);

    return {
      id: row.id,
      aggregateId: row.aggregateId,
      aggregateType: row.aggregateType,
      eventType: row.eventType,
      data,
      metadata: {
        requestId: this.readMetadataString(metadata, 'requestId'),
        userId: this.readMetadataString(metadata, 'userId'),
        organizationId: this.readMetadataString(metadata, 'organizationId'),
        locationId: this.readMetadataString(metadata, 'locationId'),
        timestamp: new Date(this.readMetadataString(metadata, 'timestamp')),
      },
    };
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error('Outbox JSON field must contain an object');
    }
    return value as Record<string, unknown>;
  }

  private readMetadataString(
    metadata: Record<string, unknown>,
    key: string,
  ): string {
    const value = metadata[key];
    if (typeof value !== 'string') {
      throw new Error(`Outbox metadata field ${key} must be a string`);
    }
    return value;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
