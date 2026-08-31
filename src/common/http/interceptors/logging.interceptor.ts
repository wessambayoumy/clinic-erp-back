import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const startTime = Date.now();
    const requestId = (request as any).id || 'unknown';
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${response.statusCode} (${duration}ms)`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} - Error (${duration}ms): ${error.message}`,
          );
        },
      }),
    );
  }
}
