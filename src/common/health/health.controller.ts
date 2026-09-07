import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('live')
  liveness(): ReturnType<HealthService['checkLiveness']> {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  readiness(): ReturnType<HealthService['checkReadiness']> {
    return this.healthService.checkReadiness();
  }

  @Get()
  health(): ReturnType<HealthService['checkHealth']> {
    return this.healthService.checkHealth();
  }
}
