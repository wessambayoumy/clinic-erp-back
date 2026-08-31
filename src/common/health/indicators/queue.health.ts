import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QueueHealthIndicator {
  private readonly logger = new Logger(QueueHealthIndicator.name);

  async isHealthy(): Promise<{ status: string }> {
    // Queue health check - BullMQ status will be checked when implemented
    return { status: 'ok' };
  }
}
