import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { RequestContextStorage } from './request-context.storage';
import type { RequestContext } from '../interfaces/request-context.interface';

/**
 * Shape of `req.user` after the JWT auth guard/strategy has already run.
 * TODO: replace with whatever your actual JWT strategy attaches — field
 * names here (`sub`, `organizationId`, `locationId`) are a guess.
 */
interface IAuthenticatedRequest {
  user?: {
    sub: string;
    organizationId: string;
    locationId: string;
  };
  id?: string;
}

/**
 * Populates `RequestContextStorage` for the lifetime of each request,
 * sourced from the verified JWT payload — never from client-supplied
 * headers. Reading `organizationId`/`locationId` off headers is the
 * vulnerability this replaces: it let any caller claim any tenant simply by
 * setting a header, with nothing checking it against who they actually
 * authenticated as.
 *
 * Must run AFTER the JWT auth guard in the pipeline (guards run before
 * interceptors in Nest's request lifecycle, so this is automatic as long as
 * auth is a guard and not itself an interceptor).
 *
 * @throws UnauthorizedException if the verified token carries no tenant
 * context. Fails closed — better a rejected request than one silently
 * running with no `RequestContext`, which would make every later
 * `TransactionService.run()` call throw anyway, just later and less clearly.
 */
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly requestContextStorage: RequestContextStorage) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();

    if (!request.user?.organizationId || !request.user.locationId) {
      throw new UnauthorizedException('Missing tenant context in verified token');
    }

    const requestContext: RequestContext = {
      requestId: request.id ?? randomUUID(),
      userId: request.user.sub,
      organizationId: request.user.organizationId,
      locationId: request.user.locationId,
      timestamp: new Date(),
    };

    return new Observable((subscriber) => {
      this.requestContextStorage.run(requestContext, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}