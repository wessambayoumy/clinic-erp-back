import { Controller } from '@nestjs/common';
import { OrganizationService } from './organization.service';

/** Handles HTTP requests for the organization feature. */
@Controller('organization')
export class OrganizationController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly organizationService: OrganizationService) {}
}
