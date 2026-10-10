import { Controller } from '@nestjs/common';
import { ClinicalWorkflowsService } from './clinical-workflows.service';

/** Handles HTTP requests for the clinical-workflows feature. */
@Controller('clinical-workflows')
export class ClinicalWorkflowsController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly clinicalWorkflowsService: ClinicalWorkflowsService) {}
}
