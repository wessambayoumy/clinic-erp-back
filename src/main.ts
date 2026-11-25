import { ConfigService } from '@nestjs/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import compress from '@fastify/compress';
import helmet from '@fastify/helmet';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { LoggerService } from './common/modules/observability/logging/logger.service.js';
import { AppModule } from './app.module.js';
import { ConfigConsts } from '@/shared/constants/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Configures and starts the Fastify HTTP server. */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  if (process.env.NODE_ENV === 'development') {
    const metadataPath = './metadata.js';
    const { default: metadata } = (await import(metadataPath)) as {
      default: () => Promise<Record<string, unknown>>;
    };
    await SwaggerModule.loadPluginMetadata(metadata);
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
          .setTitle('Clinic ERP API')
          .setVersion('1.0')
          .addBearerAuth()
          .build(),
      ),
    );
  }
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, loggerService));

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
