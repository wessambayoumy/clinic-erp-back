import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('live')
  liveness() {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  readiness() {
    return this.healthService.checkReadiness();
  }

  @Get()
  health() {
    return this.healthService.checkHealth();
  }
}
