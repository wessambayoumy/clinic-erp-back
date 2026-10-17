import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { CreateLineItemDto } from './create-line-item.dto';

/**
 * Body for PATCH /invoices/:id — valid only while the invoice is still a draft (use /finalize to lock it).
 */
export class UpdateInvoiceDto {
  /** Replacement set of line items. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  lineItems?: CreateLineItemDto[];

  /** Optional ISO-8601 due date for the invoice. */
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
