import { Module } from '@nestjs/common';

import { RLSModule } from '@/common/database/rls/rls.module';
import { SecurityModule } from '@/common/modules/security/security.module';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { RedisModule } from '@/core/redis/redis.module';
import { IdentityController } from './identity.controller';
import { IdentityRepository } from './identity.repository';
import { IdentityService } from './identity.service';

/**
 * Registers the staff identity feature: account, role, provider, and audit
 * endpoints. Exports `IdentityRepository` so the auth feature can persist
 * accounts through the same tenant-aware data access layer.
 */
@Module({
  imports: [PrismaModule, RedisModule, RLSModule, SecurityModule],
  controllers: [IdentityController],
  providers: [IdentityService, IdentityRepository],
  exports: [IdentityRepository],
})
export class IdentityModule {}
