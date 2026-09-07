import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client?: RedisClientType;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisUrl =
      this.configService.get<string>('redis.url') ||
      this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      this.logger.warn('Redis URL not configured, Redis service disabled');
      return;
    }

    try {
      this.client = createClient({ url: redisUrl }) as RedisClientType;

      this.client.on('error', (err: Error) => {
        this.logger.error(`Redis error: ${err.message}`);
      });

      this.client.on('connect', () => {
        this.isConnected = true;
      });

      await this.client.connect();
      console.log('Redis connection successfully established');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Redis connection failed (${message}), operating in degraded mode`,
      );
      this.isConnected = false;
    }
  }
}