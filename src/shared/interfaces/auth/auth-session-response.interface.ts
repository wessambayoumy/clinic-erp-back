/** Successful login response issued after the login email OTP is consumed. */
export interface IAuthSessionResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    organizationId: string;
    locationId: string;
    emailVerified: true;
  };
}
