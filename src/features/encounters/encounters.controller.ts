import { Controller } from '@nestjs/common';
import { EncountersService } from './encounters.service';

/** Handles HTTP requests for the encounters feature. */
@Controller('encounters')
export class EncountersController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly encountersService: EncountersService) {}
}
