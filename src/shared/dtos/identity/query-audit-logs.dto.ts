import { IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /audit-logs.
 */
export class QueryAuditLogsDto extends PaginationQueryDto {
  /** Filter to entries produced by a specific actor user. */
  @IsOptional()
  @IsUUID()
  userId?: string;

  /** Filter to a specific audit action name. */
  @IsOptional()
  @IsString()
  action?: string;

  /** Inclusive lower bound for the audit timestamp, as an ISO-8601 string. */
  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Inclusive upper bound for the audit timestamp, as an ISO-8601 string. */
  @IsOptional()
  @IsISO8601()
  to?: string;
}
