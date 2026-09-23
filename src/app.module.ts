import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Configuration
import { ConfigurationModule } from './config/configuration.module';

// core
import { PrismaModule } from './core/database/prisma/prisma.module';
import { RedisModule } from './core/redis/redis.module';
import { BullMQModule } from './core/bullmq/bullmq.module';

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
import { IdentityModule } from './features/identity/identity.module';
import { OrganizationModule } from './features/organization/organization.module';
import { PatientsModule } from './features/patients/patients.module';
import { SchedulingModule } from './features/scheduling/scheduling.module';
import { EncountersModule } from './features/encounters/encounters.module';
import { ClinicalWorkflowsModule } from './features/clinical-workflows/clinical-workflows.module';
import { BillingModule } from './features/billing/billing.module';
import { InventoryModule } from './features/inventory/inventory.module';
import { RequestContextStorage } from './common/http/interceptors/request-context.storage';

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

    // Core core
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
    RequestContextStorage,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes({
      path: '*path',
      method: RequestMethod.ALL,
    });
  }
}
