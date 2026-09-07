import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client?: ReturnType<typeof createClient>;
  private isConnected = false;

  get connected(): boolean {
    return this.isConnected;
  }

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      const redisUrl = this.configService.get<string>('redis.url');

      if (!redisUrl) {
        this.logger.warn('Redis URL not configured, Redis service disabled');
        this.isConnected = false;
        return;
      }

      this.client = createClient({
        url: redisUrl,
      });

      this.client.on('error', (err: Error) => {
        this.logger.error(`Redis error: ${err.message}`);
      });

      this.client.on('connect', () => {
        this.logger.log('Redis connection established');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Redis package not installed or connection failed (${message}), operating in degraded mode`,
      );
      this.isConnected = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.logger.log('Redis connection closed');
    }
  }

  getClient(): ReturnType<typeof createClient> | undefined {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) {
      this.logger.debug('Redis not available, returning null');
      return null;
    }
    return this.client.get(key);
  }

  async set(key: string, value: string, exSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      this.logger.debug('Redis not available, skipping set');
      return;
    }
    if (exSeconds) {
      await this.client.setEx(key, exSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async delete(key: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }
    return (await this.client.exists(key)) === 1;
  }
}
