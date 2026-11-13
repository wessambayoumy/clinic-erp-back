/** Minimal account projection used by public email-authentication workflows. */
export interface IAuthAccount {
  id: string;
  organizationId: string;
  email: string;
  password: string;
  emailVerified: boolean;
  isActive: boolean;
}
