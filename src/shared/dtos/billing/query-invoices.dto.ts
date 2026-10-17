import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { InvoiceScopeEnum, InvoiceStatusEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /invoices.
 */
export class QueryInvoicesDto extends PaginationQueryDto {
  /** Restrict results to a single patient. */
  @IsOptional()
  @IsUUID()
  patientId?: string;

  /** Restrict results to a single invoice status. */
  @IsOptional()
  @IsEnum(InvoiceStatusEnum)
  status?: InvoiceStatusEnum;

  /** Restrict results to a single invoice scope. */
  @IsOptional()
  @IsEnum(InvoiceScopeEnum)
  scope?: InvoiceScopeEnum;
}
