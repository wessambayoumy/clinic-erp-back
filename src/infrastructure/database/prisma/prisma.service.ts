import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const dbUrl =
      this.configService.get<string>('database.db_url') ||
      this.configService.get<string>('DATABASE_URL');

    if (!dbUrl) {
      this.logger.warn(
        'DATABASE_URL is not configured; database access is disabled',
      );
      return;
    }

    try {
      await this.$connect();
      console.log('Database connection successfully established');
    } catch (error) {
      console.error('Failed to connect to the database', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}