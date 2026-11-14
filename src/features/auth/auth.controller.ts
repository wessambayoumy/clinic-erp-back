import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '@/common/decorators/auth/public.decorator';
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dtos';
import type {
  IAuthChallengeResponse,
  IAuthSessionResponse,
  IMessageResponse,
} from '@/shared/interfaces/auth';
import { AuthService } from './auth.service';

/** Exposes public account registration, email-code login, and recovery routes. */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Creates a pending account and emails its registration OTP. */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  public register(@Body() input: RegisterDto): Promise<IAuthChallengeResponse> {
    return this.authService.register(input);
  }

  /** Activates an account after its registration OTP is consumed. */
  @Public()
  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  public verifyRegistration(@Body() input: VerifyOtpDto): Promise<IMessageResponse> {
    return this.authService.verifyRegistration(input);
  }

  /** Checks the password and sends an OTP required for every sign-in. */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  public login(@Body() input: LoginDto): Promise<IAuthChallengeResponse> {
    return this.authService.login(input);
  }

  /** Completes sign-in and returns a session after the OTP is consumed. */
  @Public()
  @Post('login/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  public verifyLogin(@Body() input: VerifyOtpDto): Promise<IAuthSessionResponse> {
    return this.authService.verifyLogin(input);
  }

  /** Requests a recovery OTP without revealing whether an account exists. */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  public requestPasswordReset(
    @Body() input: ForgotPasswordDto,
  ): Promise<IAuthChallengeResponse> {
    return this.authService.requestPasswordReset(input);
  }

  /** Resets a password after consuming the recovery OTP. */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  public resetPassword(@Body() input: ResetPasswordDto): Promise<IMessageResponse> {
    return this.authService.resetPassword(input);
  }
}
