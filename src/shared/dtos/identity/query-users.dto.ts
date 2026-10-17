import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { UserStatusEnum } from '../../enums';
import { PaginationQueryDto } from '../shared';

/**
 * Query params for GET /users.
 */
export class QueryUsersDto extends PaginationQueryDto {
  /** Filter to users in a specific lifecycle status. */
  @IsOptional()
  @IsEnum(UserStatusEnum)
  status?: UserStatusEnum;

  /** Filter to users holding a specific role. */
  @IsOptional()
  @IsUUID()
  roleId?: string;

  /** Filter to users assigned to a specific department. */
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
