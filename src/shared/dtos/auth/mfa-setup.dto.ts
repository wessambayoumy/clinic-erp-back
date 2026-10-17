import { IsEnum } from 'class-validator';

import { MfaMethodEnum } from '../../enums';

/**
 * Body for POST /auth/mfa/setup.
 */
export class MfaSetupDto {
  /** Multi-factor authentication delivery method to enroll. */
  @IsEnum(MfaMethodEnum)
  method!: MfaMethodEnum;
}
