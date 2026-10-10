import { Controller } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';

/** Handles HTTP requests for the scheduling feature. */
@Controller('scheduling')
export class SchedulingController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly schedulingService: SchedulingService) {}
}
