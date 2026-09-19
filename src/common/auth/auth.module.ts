import { Module, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { GlobalAuthGuard } from './guards/global-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

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
        const accessSecret = configService.getOrThrow<string>('auth.jwt.accessSecret');

        return {
          secret: accessSecret,
          signOptions: {
            expiresIn: configService.getOrThrow<string>('auth.jwt.accessExpiresIn'),
          },
        };
      },
    },
  ],
  exports: ['JWT_CONFIG', PassportModule],
})
export class AuthModule {}
