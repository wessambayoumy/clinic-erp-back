import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);

	async onModuleInit(): Promise<void> {
		if (!process.env.DATABASE_URL) {
			this.logger.warn(
				'DATABASE_URL is not configured; database access is disabled',
			);
			return;
		}

		await this.$connect();
		this.logger.log('Database connection established');
	}

	async onModuleDestroy(): Promise<void> {
		await this.$disconnect();
		this.logger.log('Database connection closed');
	}
}
