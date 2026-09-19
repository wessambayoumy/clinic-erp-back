import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { LoggerService } from '@common/observability/logging/logger.service';

@Injectable()
export class RedisService implements OnModuleInit {
  private client?: RedisClientType;
  private isConnected = false;

  constructor(private readonly configService: ConfigService, private readonly logger: LoggerService) {}
  
  getClient(): RedisClientType | undefined {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    const redisUrl =
      this.configService.get<string>('redis.url') ||
      this.configService.get<string>('REDIS_URL');


    if (!redisUrl) this.logger.warn('Redis URL not configured, Redis service disabled');
      

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
