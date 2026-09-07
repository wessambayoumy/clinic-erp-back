import { SetMetadata } from '@nestjs/common';
import { AuditAction } from './audit-action.enum';
export type { AuditMetadata } from './audit-metadata.interface';

export const AUDIT_KEY = 'audit';

export const Audit = (action: AuditAction, resource: string): MethodDecorator =>
  SetMetadata(AUDIT_KEY, { action, resource });
