import { Injectable } from '@nestjs/common';

/** Provides application services for the patients feature. */
@Injectable()
export class PatientsService {
  /**
   * Lists patients.
   * @param query Request value for this operation.
   */
  public listPatients(query: Record<string, unknown>): void {}

  /**
   * Registers a patient.
   * @param payload Request value for this operation.
   */
  public createPatient(payload: Record<string, unknown>): void {}

  /**
   * Gets a patient chart.
   * @param id Request value for this operation.
   */
  public getPatient(id: string): void {}

  /**
   * Updates a patient chart.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updatePatient(id: string, payload: Record<string, unknown>): void {}

  /**
   * Soft-deletes a patient chart.
   * @param id Request value for this operation.
   */
  public deletePatient(id: string): void {}

  /**
   * Searches patient records.
   * @param query Request value for this operation.
   */
  public searchPatients(query: string): void {}

  /**
   * Checks for likely duplicate patients.
   * @param payload Request value for this operation.
   */
  public checkPatientDuplicates(payload: Record<string, unknown>): void {}

  /**
   * Merges patient charts.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public mergePatients(id: string, payload: Record<string, unknown>): void {}

  /**
   * Lists patient allergies.
   * @param id Request value for this operation.
   */
  public listPatientAllergies(id: string): void {}

  /**
   * Adds a patient allergy.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public addPatientAllergy(
    id: string,
    payload: Record<string, unknown>,
  ): void {}

  /**
   * Updates a patient allergy.
   * @param id Request value for this operation.
   * @param allergyId Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updatePatientAllergy(
    id: string,
    allergyId: string,
    payload: Record<string, unknown>,
  ): void {}

  /**
   * Removes a patient allergy.
   * @param id Request value for this operation.
   * @param allergyId Request value for this operation.
   */
  public deletePatientAllergy(id: string, allergyId: string): void {}

  /**
   * Lists patient medications.
   * @param id Request value for this operation.
   */
  public listPatientMedications(id: string): void {}

  /**
   * Lists patient medical histories.
   * @param id Request value for this operation.
   */
  public listPatientHistories(id: string): void {}

  /**
   * Lists patient documents.
   * @param id Request value for this operation.
   */
  public listPatientDocuments(id: string): void {}

  /**
   * Adds a patient document.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public uploadPatientDocument(
    id: string,
    payload: Record<string, unknown>,
  ): void {}

  /**
   * Gets a patient document.
   * @param id Request value for this operation.
   * @param documentId Request value for this operation.
   */
  public downloadPatientDocument(id: string, documentId: string): void {}

  /**
   * Removes a patient document.
   * @param id Request value for this operation.
   * @param documentId Request value for this operation.
   */
  public deletePatientDocument(id: string, documentId: string): void {}
}
