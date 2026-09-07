import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { RequestContext } from './request-context.interface';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    context?: RequestContext;
    user?: AuthenticatedUser;
  }
}
