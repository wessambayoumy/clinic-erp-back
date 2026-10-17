import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { FaxDirectionEnum, FaxStatusEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /fax — inbox/outbox listing.
 */
export class QueryFaxDto extends PaginationQueryDto {
  /** Restrict results to a single fax direction. */
  @IsOptional()
  @IsEnum(FaxDirectionEnum)
  direction?: FaxDirectionEnum;

  /** Restrict results to a single delivery status. */
  @IsOptional()
  @IsEnum(FaxStatusEnum)
  status?: FaxStatusEnum;

  /** Restrict results to faxes linked to a single patient. */
  @IsOptional()
  @IsUUID()
  patientId?: string;
}
