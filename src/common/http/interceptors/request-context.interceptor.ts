import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestContextInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract organization and location from request headers
    // In a real implementation, these would be extracted from JWT and verified
    const organizationId = request.get('x-organization-id') ?? '';
    const locationId = request.get('x-location-id') ?? '';
    const requestId = request.get('x-request-id') || 'unknown';

    // Store in request for downstream use
    request.context = {
      requestId,
      organizationId,
      locationId,
      userId: request.user?.id,
      timestamp: new Date(),
    };

    return next.handle();
  }
}
