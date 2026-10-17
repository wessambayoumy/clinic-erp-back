import { IsEnum } from 'class-validator';

import { UserStatusEnum } from '../../enums';

/**
 * Body for PATCH /users/:id/status.
 */
export class UpdateUserStatusDto {
  /** New lifecycle status for the user account. */
  @IsEnum(UserStatusEnum)
  status!: UserStatusEnum;
}
