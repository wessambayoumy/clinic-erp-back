import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import postgres from '@prisma/orm-postgres/runtime';
import { LoggerService } from '@common/observability/logging/logger.service';
import contractJson from '@/prisma/contract.json';

type DbClient = ReturnType<typeof postgres>;

/**
 * Wraps the Prisma 8 PostgreSQL ORM client in a Nest-managed lifecycle.
 * Connects eagerly on module init so connection failures surface at
 * startup rather than on the first request, and closes cleanly on
 * module destroy. Exposes the underlying client via `client` for
 * `RLSService` to run tenant-scoped transactions against.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private dbClient: DbClient | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * The connected Prisma 8 client. Throws if accessed before
   * `onModuleInit` has connected successfully, so callers fail fast
   * instead of silently querying a disconnected client.
   */
  get client(): DbClient {
    if (!this.dbClient) {
      throw new Error('PrismaService: database client is not connected');
    }
    return this.dbClient;
  }

  async onModuleInit(): Promise<void> {
    const dbUrl =
      this.configService.get<string>('database.db_url') ??
      this.configService.get<string>('DATABASE_URL');

    if (!dbUrl) {
      this.logger.warn(
        'DATABASE_URL is not configured; database access is disabled',
      );
      return;
    }

    this.dbClient = postgres({ contractJson, url: dbUrl });

    try {
      await this.dbClient.connect();
      this.logger.log('Database connection successfully established');
    } catch (error) {
      this.logger.error(
        'Failed to connect to the database',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.dbClient) {
      await this.dbClient.close();
      this.logger.log('Database connection closed');
    }
  }
}
