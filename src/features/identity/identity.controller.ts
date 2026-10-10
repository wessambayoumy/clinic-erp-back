import { Controller } from '@nestjs/common';
import { IdentityService } from './identity.service';

/** Handles HTTP requests for the identity feature. */
@Controller('identity')
export class IdentityController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly identityService: IdentityService) {}
}
