import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { MailModule } from '@nestjs/mail';

import { RLSModule } from '@/common/database/rls/rls.module';
import { IdentityRepository } from '@/common/database/repositories/identity.repository';
import { EmailService } from '@/common/services/email';
import { SecurityModule } from '@/common/modules/security-module/src/core/security/security.module';
import { createEmailModuleOptions } from '@/core/external/email/email.module.options';
import {
  AccountOtpMail,
  LoginNoticeMail,
  PasswordChangedMail,
  StaffInvitationMail,
} from '@/core/external/email/templates';
import { OtpCacheService } from '@/core/external/email/otp/otp-cache.service';
import { OtpCredentialService } from '@/core/external/email/otp/otp-credential.service';
import { EmailNotificationProcessor } from '@/core/bullmq/processors';
import { BullMQModule } from '@/core/bullmq/bullmq.module';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { RedisModule } from '@/core/redis/redis.module';
import { EmailQueueEnum } from '@/shared/enums';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    RLSModule,
    SecurityModule,
    BullMQModule,
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
  controllers: [IdentityController, AuthController],
  providers: [
    IdentityService,
    IdentityRepository,
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
/** Registers the HTTP and application providers for identity. */
export class IdentityModule {}
