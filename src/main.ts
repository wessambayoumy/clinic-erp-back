import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { RequestContextInterceptor } from './common/http/interceptors/request-context.interceptor';
import { LoggingInterceptor } from './common/http/interceptors/logging.interceptor';
import { RequestIdMiddleware } from './common/http/middleware/request-id.middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix for API routes
  const apiPrefix = process.env.API_PREFIX ?? 'api';
  app.setGlobalPrefix(apiPrefix);

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Organization-ID',
      'X-Location-ID',
    ],
  });

  // Request ID middleware
  app.use(RequestIdMiddleware);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`✓ Application running on port ${port}`);
  logger.log(`✓ API prefix: /${apiPrefix}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
