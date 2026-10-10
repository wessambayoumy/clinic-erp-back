import { Controller } from '@nestjs/common';
import { BillingService } from './billing.service';

/** Handles HTTP requests for the billing feature. */
@Controller('billing')
export class BillingController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly billingService: BillingService) {}
}
