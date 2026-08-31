import { Injectable, Logger } from '@nestjs/common';
import { AuditRecord } from './audit.types';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  /**
   * Log an audit record
   * In production, this would persist to a secure audit log database
   * For now, we'll just log it
   */
  log(record: AuditRecord): void {
    try {
      this.logger.log(
        `Audit: ${record.action} on ${record.resource}/${record.resourceId} - ${record.result}`,
        'AuditService',
        {
          requestId: record.requestId,
          actor: record.actor,
          result: record.result,
          details: record.details,
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to log audit record: ${message}`);
      // Don't throw on audit failures - they should not break the application
    }
  }
}
