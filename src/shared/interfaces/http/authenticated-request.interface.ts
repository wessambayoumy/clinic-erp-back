import type { IAuthenticatedUser } from '../auth';

/** Shape of the HTTP request after the auth guard has attached a verified user. */
export interface IAuthenticatedRequest {
  user?: IAuthenticatedUser;
  id?: string;
}
