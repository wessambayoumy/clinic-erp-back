import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { InvoiceScopeEnum } from '../../enums';

import { CreateLineItemDto } from './create-line-item.dto';

/**
 * Body for POST /invoices — draft a new invoice.
 */
export class CreateInvoiceDto {
  /** Patient the invoice is issued to. */
  @IsUUID()
  patientId!: string;

  /** Location the invoice belongs to. */
  @IsUUID()
  locationId!: string;

  /** Optional department the invoice belongs to. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  /** Whether the invoice covers one department or consolidates several. */
  @IsEnum(InvoiceScopeEnum)
  scope!: InvoiceScopeEnum;

  /** Line items billed on the invoice. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  lineItems!: CreateLineItemDto[];
}
