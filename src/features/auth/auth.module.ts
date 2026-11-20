import { Module } from '@nestjs/common';

import { RLSModule } from '@/common/database/rls/rls.module';
import { AuthenticationModule } from '@/common/modules/auth/authentication.module';
import { SecurityModule } from '@/common/modules/security/security.module';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { EmailModule } from '@/core/external/email/email.module';

import { IdentityModule } from '../identity/identity.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenCleanupService } from './refresh-token-cleanup.service';

@Module({
  imports: [
    PrismaModule,
    RLSModule,
    SecurityModule,
    AuthenticationModule,
    IdentityModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenCleanupService],
})
export class AuthModule {}
