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
        const logger = new Logger('AuthModule');
        const accessSecret = configService.get<string>('auth.jwt.accessSecret');

        if (!accessSecret) {
          logger.warn('JWT_ACCESS_SECRET not configured');
        }

        return {
          secret: accessSecret,
          signOptions: {
            expiresIn: configService.get<string>('auth.jwt.accessExpiresIn'),
          },
        };
      },
    },
  ],
  exports: ['JWT_CONFIG', PassportModule],
})
export class AuthModule {}
