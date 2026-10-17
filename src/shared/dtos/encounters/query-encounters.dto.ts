import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { EncounterStatusEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /encounters and GET /patients/:id/encounters.
 */
export class QueryEncountersDto extends PaginationQueryDto {
  /** Restrict results to a single patient. */
  @IsOptional()
  @IsUUID()
  patientId?: string;

  /** Restrict results to a single provider. */
  @IsOptional()
  @IsUUID()
  providerId?: string;

  /** Restrict results to encounters in a given lifecycle status. */
  @IsOptional()
  @IsEnum(EncounterStatusEnum)
  status?: EncounterStatusEnum;
}
