import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LoggerService } from '@common/observability/logging/logger.service';

@Module({
  providers: [PrismaService, LoggerService],
  exports: [PrismaService],
})
export class PrismaModule {}
