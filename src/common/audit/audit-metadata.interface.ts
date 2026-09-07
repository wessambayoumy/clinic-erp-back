import { AuditAction } from './audit-action.enum';

export interface AuditMetadata {
  action: AuditAction;
  resource: string;
}
