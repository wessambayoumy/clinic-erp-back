import { ConfigService } from '@nestjs/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Catch, ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';

import { LoggerService } from './common/observability/logging/logger.service.js';
import { AppModule } from './app.module.js';
import { ConfigConsts } from './config/config.consts';

/** Global exception filter to catch and log unhandled errors clearly with Fastify. */
@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    console.error('=== CAUGHT UNHANDLED EXCEPTION ===', exception);

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: exception instanceof Error ? exception.message : 'Internal server error',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

/** Configures and starts the Fastify HTTP server. */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const port = configService.getOrThrow<number>(ConfigConsts.app.port);
  const apiPrefix = configService.getOrThrow<string>(
    ConfigConsts.app.apiPrefix,
  );
  const corsOrigins = configService
    .getOrThrow<string>(ConfigConsts.app.corsOrigin)
    .split(',')
    .map((origin: string): string => origin.trim())
    .filter((origin: string): boolean => origin.length > 0);

  await app.register(helmet);
  await app.register(compress);
  app.setGlobalPrefix(apiPrefix);
  app.enableCors({ origin: corsOrigins });

  app.enableShutdownHooks();
  process.on('SIGTERM', async () => {
    loggerService.log('SIGTERM signal received: closing HTTP server');
    await app.close();
    loggerService.log('HTTP server closed');
  });

  await app.listen({ port, host: '0.0.0.0' });
  loggerService.log(`Server is running on port ${String(port)}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  process.stderr.write(
    JSON.stringify({
      level: 'fatal',
      message: 'Failed to start application',
      error: errorMessage,
    }) + '\n',
  );
  process.exitCode = 1;
});