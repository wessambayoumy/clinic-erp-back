import { Injectable } from '@nestjs/common';

import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  MfaSetupDto,
  MfaVerifyDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dtos';

/** Authentication service placeholders for the controller routes. */
@Injectable()
export class AuthService {
  public register(_input: RegisterDto): void {}

  public verifyRegistration(_input: VerifyOtpDto): void {}

  public login(_input: LoginDto): void {}

  public verifyLogin(_input: VerifyOtpDto): void {}

  public requestPasswordReset(_input: ForgotPasswordDto): void {}

  public resetPassword(_input: ResetPasswordDto): void {}

  public refresh(_input: RefreshTokenDto): void {}

  public logout(): void {}

  public changePassword(_input: ChangePasswordDto): void {}

  public setupMfa(_input: MfaSetupDto): void {}

  public verifyMfa(_input: MfaVerifyDto): void {}
}
