import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /inventory/suppliers.
 */
export class CreateSupplierDto {
  /** Display name of the supplier. */
  @IsString()
  name!: string;

  /** Contact email address for the supplier. */
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  /** Contact phone number for the supplier. */
  @IsOptional()
  @IsString()
  contactPhone?: string;
}
