import { Controller } from '@nestjs/common';
import { PatientsService } from './patients.service';

/** Handles HTTP requests for the patients feature. */
@Controller('patients')
export class PatientsController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly patientsService: PatientsService) {}
}
