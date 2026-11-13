import { Module } from '@nestjs/common';

import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { RLSService } from './rls.service';

/** Exposes tenant-context application to modules that run scoped transactions. */
@Module({
  imports: [PrismaModule],
  providers: [RLSService, LoggerService],
  exports: [RLSService],
})
export class RLSModule {}
