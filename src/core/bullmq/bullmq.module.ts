import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

/** Registers the shared BullMQ connection over the application's Redis instance. */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>('bullmq.redisUrl'),
          maxRetriesPerRequest: null,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class BullMQModule {}
