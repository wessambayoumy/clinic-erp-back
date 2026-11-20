import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { Public } from '../decorators/auth/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('live')
  @HealthCheck()
  liveness(): ReturnType<HealthService['checkLiveness']> {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  @HealthCheck()
  readiness(): ReturnType<HealthService['checkReadiness']> {
    return this.healthService.checkReadiness();
  }

  @Get()
  @HealthCheck()
  health(): ReturnType<HealthService['checkHealth']> {
    return this.healthService.checkHealth();
  }
}
