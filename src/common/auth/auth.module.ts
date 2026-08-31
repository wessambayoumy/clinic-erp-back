import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
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
  exports: ['JWT_CONFIG'],
})
export class AuthModule {}
