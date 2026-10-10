import { Controller } from '@nestjs/common';
import { IdentityService } from './identity.service';

/** Handles HTTP requests for the identity feature. */
@Controller('identity')
export class IdentityController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly identityService: IdentityService) {}

  /**
   * Lists staff accounts.
   * @param query Request value for this operation.
   */
  public listUsers(query: Record<string, unknown>): void {
  }

  /**
   * Creates a staff account.
   * @param payload Request value for this operation.
   */
  public createUser(payload: Record<string, unknown>): void {
  }

  /**
   * Gets a staff account.
   * @param id Request value for this operation.
   */
  public getUser(id: string): void {
  }

  /**
   * Updates a staff account.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateUser(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Removes a staff account.
   * @param id Request value for this operation.
   */
  public deleteUser(id: string): void {
  }

  /**
   * Changes a staff account status.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateUserStatus(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Creates a staff invitation.
   * @param payload Request value for this operation.
   */
  public createUserInvitation(payload: Record<string, unknown>): void {
  }

  /**
   * Accepts a staff invitation.
   * @param token Request value for this operation.
   * @param payload Request value for this operation.
   */
  public acceptUserInvitation(token: string, payload: Record<string, unknown>): void {
  }

  /**
   * Lists provider profiles.
   * @param query Request value for this operation.
   */
  public listProviders(query: Record<string, unknown>): void {
  }

  /**
   * Creates a provider profile.
   * @param payload Request value for this operation.
   */
  public createProvider(payload: Record<string, unknown>): void {
  }

  /**
   * Gets a provider profile.
   * @param id Request value for this operation.
   */
  public getProvider(id: string): void {
  }

  /**
   * Updates a provider profile.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateProvider(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Lists organization roles.
   */
  public listRoles(): void {
  }

  /**
   * Creates an organization role.
   * @param payload Request value for this operation.
   */
  public createRole(payload: Record<string, unknown>): void {
  }

  /**
   * Gets a role.
   * @param id Request value for this operation.
   */
  public getRole(id: string): void {
  }

  /**
   * Updates a role.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateRole(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Removes a role.
   * @param id Request value for this operation.
   */
  public deleteRole(id: string): void {
  }

  /**
   * Lists assignable permissions.
   */
  public listPermissions(): void {
  }

  /**
   * Replaces a user role set.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public replaceUserRoles(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Lists audit logs.
   * @param query Request value for this operation.
   */
  public listAuditLogs(query: Record<string, unknown>): void {
  }
}
