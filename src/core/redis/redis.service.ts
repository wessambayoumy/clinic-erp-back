import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { ConfigConsts } from '@/shared/constants/config';

/** Owns the application's shared ioredis connection. */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public client?: Redis;
  public isConnected = false;

  /**
   * Creates the Redis service.
   * @param configService Application configuration.
   * @param logger Structured application logger.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /** Returns the shared Redis client when it has been initialized. */
  public getClient(): Redis | undefined {
    return this.client;
  }

  /** Connects to Redis during module initialization. */
  public async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.getOrThrow<string>(
      ConfigConsts.redis.url,
    );

    try {
      this.client = new Redis(redisUrl, { lazyConnect: true });

      this.client.on('error', (err: Error): void => {
        this.logger.error(`Redis error: ${err.message}`);
      });

      this.client.on('ready', (): void => {
        this.isConnected = true;
      });

      this.client.on('close', (): void => {
        this.isConnected = false;
      });

      await this.client.connect();
      this.logger.log('Redis connection successfully established');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Redis connection failed (${message}), operating in degraded mode`,
      );
      this.isConnected = false;
    }
  }

  /** Closes the Redis connection during module shutdown. */
  public async onModuleDestroy(): Promise<void> {
    if (!this.client || this.client.status === 'end') return;

    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error: unknown) {
      this.logger.warn(
        `Redis shutdown failed (${error instanceof Error ? error.message : String(error)})`,
      );
    }
  }
}
