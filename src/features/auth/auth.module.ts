import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { MailModule } from '@nestjs/mail';

import { RLSModule } from '@/common/database/rls/rls.module';
import { SecurityModule } from '@/common/modules/security/security.module';
import { EmailService } from '@/common/services/email';
import {
  OtpCacheService,
  OtpCredentialService,
} from '@/common/services/email/otp';
import { BullMQModule } from '@/core/bullmq/bullmq.module';
import { EmailNotificationProcessor } from '@/core/bullmq/processors';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { createEmailModuleOptions } from '@/core/external/email/email.module.options';
import {
  AccountOtpMail,
  LoginNoticeMail,
  PasswordChangedMail,
  StaffInvitationMail,
} from '@/core/external/email/templates';
import { RedisModule } from '@/core/redis/redis.module';
import { EmailQueueEnum } from '@/shared/enums';
import { IdentityModule } from '../identity/identity.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Owns registration, email-code sign-in, and password recovery.
 *
 * Depends on `IdentityModule` for tenant-aware account persistence and on the
 * shared `SecurityModule` for password hashing.
 */
@Module({
  imports: [
    PrismaModule,
    RedisModule,
    RLSModule,
    SecurityModule,
    BullMQModule,
    IdentityModule,
    BullModule.registerQueue({ name: EmailQueueEnum.ACCOUNT_NOTIFICATIONS }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('auth.jwt.accessSecret'),
        signOptions: {
          expiresIn: config.getOrThrow<string>(
            'auth.jwt.accessExpiresIn',
          ) as NonNullable<JwtModuleOptions['signOptions']>['expiresIn'],
          issuer: config.get<string>('auth.jwt.issuer'),
          audience: config.get<string>('auth.jwt.audience'),
        },
      }),
    }),
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createEmailModuleOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    OtpCacheService,
    OtpCredentialService,
    EmailNotificationProcessor,
    AccountOtpMail,
    LoginNoticeMail,
    PasswordChangedMail,
    StaffInvitationMail,
  ],
})
export class AuthModule {}
