export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId: string;
  locationId: string;
  roles: string[];
}
