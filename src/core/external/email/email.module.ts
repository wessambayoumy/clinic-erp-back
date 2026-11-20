import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailModule } from '@nestjs/mail';

import { EmailService } from '@/common/services/email';
import { SecurityModule } from '@/common/modules/security/security.module';
import {
  OtpCacheService,
  OtpCredentialService,
} from '@/common/services/email/otp';
import { BullMQModule } from '@/core/bullmq/bullmq.module';
import { EmailNotificationProcessor } from '@/core/bullmq/processors';
import { RedisModule } from '@/core/redis/redis.module';
import { EmailQueueEnum } from '@/shared/enums';

import { createEmailModuleOptions } from './email.module.options';
import {
  AccountOtpMail,
  LoginNoticeMail,
  PasswordChangedMail,
  StaffInvitationMail,
} from './templates';

@Module({
  imports: [
    SecurityModule,
    RedisModule,
    BullMQModule,
    BullModule.registerQueue({ name: EmailQueueEnum.ACCOUNT_NOTIFICATIONS }),
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createEmailModuleOptions,
    }),
  ],
  providers: [
    EmailService,
    OtpCacheService,
    OtpCredentialService,
    EmailNotificationProcessor,
    AccountOtpMail,
    LoginNoticeMail,
    PasswordChangedMail,
    StaffInvitationMail,
  ],
  exports: [EmailService, OtpCacheService, OtpCredentialService],
})
export class EmailModule {}
