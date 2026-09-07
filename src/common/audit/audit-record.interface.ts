import { AuditAction } from './audit-action.enum';
import { AuditResult } from './audit-result.enum';

export interface AuditRecord {
  id?: string;
  requestId: string;
  timestamp: Date;
  action: AuditAction;
  resource: string;
  resourceId: string;
  result: AuditResult;
  details?: Record<string, unknown>;
  actor: {
    userId: string;
    organizationId: string;
    locationId: string;
  };
}
