import { RLSModule } from '@/common';
import { Module } from '@nestjs/common';
import { PrismaModule } from './database';
import { RedisModule } from './redis';
import { BullMQModule } from './bullmq';
import { DicomModule } from './external/dicom';

const modules = [
  PrismaModule,
  RedisModule,
  BullMQModule,
  RLSModule,
  DicomModule,
];

@Module({
  imports: modules,
  exports: modules,
  controllers: [],
  providers: [],
})
export class CoreModules {}
