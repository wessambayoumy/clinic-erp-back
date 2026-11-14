import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { minutes, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Configuration
import { ConfigurationModule } from './config/configuration.module';
// Database services
import { TransactionService } from './common/database/transaction/transaction.service';
// Middleware
import { RequestIdMiddleware } from './common/http/middleware/request-id.middleware';

import { FeaturesModule } from './features';
import { RequestContextInterceptor } from './common/http/interceptors/request-context.interceptor';
import { RequestContextStorage } from './common/http/interceptors/request-context.storage';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { CoreModules } from './core/core.modules';
import { CommonModules } from './common/common.modules';

@Module({
  imports: [
    // Global configuration must be loaded first
    ConfigurationModule,
    ThrottlerModule.forRoot([
      {
        ttl: minutes(1),
        limit: 100,
      },
    ]),

    CoreModules,
    CommonModules,
    FeaturesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TransactionService,
    RequestContextStorage,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ErrorInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
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
