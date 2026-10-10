import { Module } from '@nestjs/common';
import { EncountersController } from './encounters.controller';
import { EncountersService } from './encounters.service';

@Module({
  controllers: [EncountersController],
  providers: [EncountersService],
})
/** Registers the HTTP and application providers for encounters. */
export class EncountersModule {}
