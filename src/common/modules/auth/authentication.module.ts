import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { GlobalAuthGuard } from '../../guards/auth/global-auth.guard';
import { JwtStrategy } from '../../strategies/auth/jwt.strategy';
import { RefreshTokenStrategy } from '../../strategies/auth/refresh-token.strategy';
import { ConfigConsts } from '@/shared';

/**
 * Registers the cross-cutting authentication infrastructure: JWT strategies,
 * the global auth guard, and the shared `JWT_CONFIG` provider.
 *
 * The auth feature (`features/auth`) owns the signup/sign-in workflows; this
 * module only wires the guards and strategies those workflows rely on.
 */
@Module({
  imports: [PassportModule],
  providers: [
    JwtStrategy,
    RefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
    {
      provide: 'JWT_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const accessSecret = configService.getOrThrow<string>(
          ConfigConsts.auth.jwtSecret,
        );

        return {
          secret: accessSecret,
          signOptions: {
            expiresIn: configService.getOrThrow<string>(
              ConfigConsts.auth.jwtExpirationTime,
            ),
          },
        };
      },
    },
  ],
  exports: ['JWT_CONFIG', PassportModule],
})
export class AuthenticationModule {}
