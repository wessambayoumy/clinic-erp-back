export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface AuditRecord {
  id?: string;
  requestId: string;
  timestamp: Date;
  action: AuditAction;
  resource: string;
  resourceId: string;
  result: AuditResult;
  details?: Record<string, any>;
  actor: {
    userId: string;
    organizationId: string;
    locationId: string;
  };
}
