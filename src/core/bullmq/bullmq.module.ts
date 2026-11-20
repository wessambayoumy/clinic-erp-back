import { Module } from '@nestjs/common';
import { BullModule, type BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { ConfigConsts } from '@/shared';

/** Registers the shared BullMQ connection over the application's Redis instance. */
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): BullRootModuleOptions => ({
        connection: {
          url: configService.getOrThrow<string>(
            ConfigConsts.bullmq.connectionString,
          ),
          maxRetriesPerRequest: null,
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class BullMQModule {}
