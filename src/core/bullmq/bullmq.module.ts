import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// BullMQ module - to be wired up when @nestjs/bullmq is installed
@Module({
  providers: [
    {
      provide: 'BULLMQ_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('BullMQModule');
        const redisUrl = configService.get<string>('bullmq.redisUrl');

        if (!redisUrl) {
          logger.warn('BullMQ Redis URL not configured');
        }

        return {
          connection: {
            url: redisUrl,
          },
        };
      },
    },
  ],
  exports: ['BULLMQ_CONFIG'],
})
export class BullMQModule {}
