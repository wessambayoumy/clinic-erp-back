import type { IAuthenticatedUser } from '../auth';
import type { IRequestContext } from './request-context.interface';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    context?: IRequestContext;
    user?: IAuthenticatedUser;
  }
}
