import { Injectable } from '@nestjs/common';

/** Provides application services for the organization feature. */
@Injectable()
export class OrganizationService {
  /**
   * Gets the organization profile.
   */
  public getOrganization(): void {}

  /**
   * Updates the organization profile.
   * @param payload Request value for this operation.
   */
  public updateOrganization(payload: Record<string, unknown>): void {}

  /**
   * Gets organization-wide settings.
   */
  public getOrganizationSettings(): void {}

  /**
   * Updates organization-wide settings.
   * @param payload Request value for this operation.
   */
  public updateOrganizationSettings(payload: Record<string, unknown>): void {}

  /**
   * Lists locations.
   * @param query Request value for this operation.
   */
  public listLocations(query: Record<string, unknown>): void {}

  /**
   * Creates a location.
   * @param payload Request value for this operation.
   */
  public createLocation(payload: Record<string, unknown>): void {}

  /**
   * Gets a location.
   * @param id Request value for this operation.
   */
  public getLocation(id: string): void {}

  /**
   * Updates a location.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateLocation(id: string, payload: Record<string, unknown>): void {}

  /**
   * Removes a location.
   * @param id Request value for this operation.
   */
  public deleteLocation(id: string): void {}

  /**
   * Gets location settings.
   * @param id Request value for this operation.
   */
  public getLocationSettings(id: string): void {}

  /**
   * Updates location settings.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateLocationSettings(
    id: string,
    payload: Record<string, unknown>,
  ): void {}

  /**
   * Lists departments.
   * @param query Request value for this operation.
   */
  public listDepartments(query: Record<string, unknown>): void {}

  /**
   * Creates a department.
   * @param payload Request value for this operation.
   */
  public createDepartment(payload: Record<string, unknown>): void {}

  /**
   * Gets a department.
   * @param id Request value for this operation.
   */
  public getDepartment(id: string): void {}

  /**
   * Updates a department.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateDepartment(id: string, payload: Record<string, unknown>): void {}

  /**
   * Removes a department.
   * @param id Request value for this operation.
   */
  public deleteDepartment(id: string): void {}

  /**
   * Replaces providers assigned to a department.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public assignDepartmentProviders(
    id: string,
    payload: Record<string, unknown>,
  ): void {}
}
