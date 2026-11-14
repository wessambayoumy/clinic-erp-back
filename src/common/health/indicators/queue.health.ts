import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';

@Injectable()
export class QueueHealthIndicator {
  constructor(private readonly logger: LoggerService) {}

  async isHealthy(): Promise<{ status: string }> {
    // Queue health check - BullMQ status will be checked when implemented
    return { status: 'ok' };
  }
}
