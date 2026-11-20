import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '@/common/decorators/auth/public.decorator';
import { RefreshTokenGuard } from '@/common/guards/auth/refresh-token.guard';
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
import { AuthService } from './auth.service';

/** Declares the public authentication API routes. */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  public register(@Body() input: RegisterDto): void {
    this.authService.register(input);
  }

  @Public()
  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  public verifyRegistration(@Body() input: VerifyOtpDto): void {
    this.authService.verifyRegistration(input);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  public login(@Body() input: LoginDto): void {
    this.authService.login(input);
  }

  @Public()
  @Post('login/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  public verifyLogin(@Body() input: VerifyOtpDto): void {
    this.authService.verifyLogin(input);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  public requestPasswordReset(@Body() input: ForgotPasswordDto): void {
    this.authService.requestPasswordReset(input);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  public resetPassword(@Body() input: ResetPasswordDto): void {
    this.authService.resetPassword(input);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public refresh(@Body() input: RefreshTokenDto): void {
    this.authService.refresh(input);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public logout(): void {
    this.authService.logout();
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  public changePassword(@Body() input: ChangePasswordDto): void {
    this.authService.changePassword(input);
  }

  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  public setupMfa(@Body() input: MfaSetupDto): void {
    this.authService.setupMfa(input);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  public verifyMfa(@Body() input: MfaVerifyDto): void {
    this.authService.verifyMfa(input);
  }
}
