import { SetMetadata } from '@nestjs/common';
import { AuditAction } from './audit.types';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: AuditAction;
  resource: string;
}

export const Audit = (action: AuditAction, resource: string): MethodDecorator =>
  SetMetadata(AUDIT_KEY, { action, resource });
