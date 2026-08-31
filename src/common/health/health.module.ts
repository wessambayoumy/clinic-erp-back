import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { PrismaModule } from '@infrastructure/database/prisma/prisma.module';
import { RedisModule } from '@infrastructure/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
