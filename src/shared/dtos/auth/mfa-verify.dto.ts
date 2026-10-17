import { IsEnum, IsString } from 'class-validator';

import { MfaMethodEnum } from '../../enums';

/**
 * Body for POST /auth/mfa/verify.
 */
export class MfaVerifyDto {
  /** Multi-factor authentication delivery method the code was sent through. */
  @IsEnum(MfaMethodEnum)
  method!: MfaMethodEnum;

  /** One-time verification code supplied by the user. */
  @IsString()
  code!: string;
}
