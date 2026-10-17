import { IsEnum, IsOptional } from 'class-validator';

import { InvoiceScopeEnum } from '../../enums';

/**
 * Body for POST /invoices/from-encounter/:encounterId.
 */
export class GenerateInvoiceFromEncounterDto {
  /** Optional scope for the generated invoice. */
  @IsOptional()
  @IsEnum(InvoiceScopeEnum)
  scope?: InvoiceScopeEnum;
}
