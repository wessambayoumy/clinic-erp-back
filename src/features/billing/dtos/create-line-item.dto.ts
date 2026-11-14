import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

/**
 * One invoice line item, nested inside CreateInvoiceDto/UpdateInvoiceDto.
 */
export class CreateLineItemDto {
  /** Description of the billed service. */
  @IsString()
  description!: string;

  /** Number of units billed. */
  @IsInt()
  @Min(1)
  quantity!: number;

  /** Price per unit, in cents. */
  @IsInt()
  @Min(0)
  unitPriceCents!: number;

  /** Optional encounter this line item originated from. */
  @IsOptional()
  @IsUUID()
  encounterId?: string;
}
