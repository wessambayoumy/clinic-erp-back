import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RequestContextInterceptor } from './common/http/interceptors/request-context.interceptor';
import { LoggingInterceptor } from './common/http/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './common/http/middleware/request-id.middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  const corsOrigin = configService.get<string>('app.corsOrigin');

  app.use(helmet());
  app.setGlobalPrefix(apiPrefix);
  app.enableCors({ origin: corsOrigin });

  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/${apiPrefix}`);
  });

  // Request ID middleware
  app.use(RequestIdMiddleware);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  // Global interceptors for request context and logging
  app.useGlobalInterceptors(
    new RequestContextInterceptor(),
    new LoggingInterceptor(),
  );

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    await app.close();
    logger.log('HTTP server closed');
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Failed to start application',
    error instanceof Error ? error.stack : String(error),
  );
  process.exit(1);
});
