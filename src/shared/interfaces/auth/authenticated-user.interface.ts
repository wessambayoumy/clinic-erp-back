export interface IAuthenticatedUser {
  id: string;
  email: string;
  organizationId: string;
  locationId: string;
  roles: string[];
}
