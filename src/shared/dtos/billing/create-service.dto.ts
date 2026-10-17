import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

/**
 * Body for POST /services — priced service catalog entry.
 */
export class CreateServiceDto {
  /** Display name of the service. */
  @IsString()
  name!: string;

  /** Optional catalog code for the service. */
  @IsOptional()
  @IsString()
  code?: string;

  /** Price of the service, in cents. */
  @IsInt()
  @Min(0)
  priceCents!: number;

  /** Optional department the service belongs to. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
