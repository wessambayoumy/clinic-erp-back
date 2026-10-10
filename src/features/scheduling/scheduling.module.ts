import { Module } from '@nestjs/common';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';

@Module({
  controllers: [SchedulingController],
  providers: [SchedulingService],
})
/** Registers the HTTP and application providers for scheduling. */
export class SchedulingModule {}
