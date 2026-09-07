import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Configuration
import { ConfigurationModule } from './config/configuration.module';

// Infrastructure
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { BullMQModule } from './infrastructure/bullmq/bullmq.module';

// Common services
import { AuthModule } from './common/auth/auth.module';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { HealthModule } from './common/health/health.module';
import { ObservabilityModule } from './common/observability/observability.module';
import { AuditModule } from './common/audit/audit.module';
import { EventsModule } from './common/events/events.module';

// Database services
import { RLSService } from './common/database/rls/rls.service';
import { TransactionService } from './common/database/transaction/transaction.service';

// Middleware
import { RequestIdMiddleware } from './common/http/middleware/request-id.middleware';

// Business modules
import { IdentityModule } from './modules/identity/identity.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PatientsModule } from './modules/patients/patients.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { EncountersModule } from './modules/encounters/encounters.module';
import { ClinicalWorkflowsModule } from './modules/clinical-workflows/clinical-workflows.module';
import { BillingModule } from './modules/billing/billing.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Global configuration must be loaded first
    ConfigurationModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // Core infrastructure
    PrismaModule,
    RedisModule,
    BullMQModule,

    // Common/shared services
    AuthModule,
    AuthorizationModule,
    HealthModule,
    ObservabilityModule,
    AuditModule,
    EventsModule,

    // Business bounded contexts
    IdentityModule,
    OrganizationModule,
    PatientsModule,
    SchedulingModule,
    EncountersModule,
    ClinicalWorkflowsModule,
    BillingModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RLSService,
    TransactionService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
