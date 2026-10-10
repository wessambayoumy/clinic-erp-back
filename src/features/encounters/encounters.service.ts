import { Injectable } from '@nestjs/common';

/** Provides application services for the encounters feature. */
@Injectable()
export class EncountersService {
  /**
   * Lists encounters.
   * @param query Request value for this operation.
   */
  public listEncounters(query: Record<string, unknown>): void {
  }

  /**
   * Opens an encounter.
   * @param payload Request value for this operation.
   */
  public createEncounter(payload: Record<string, unknown>): void {
  }

  /**
   * Gets an encounter.
   * @param id Request value for this operation.
   */
  public getEncounter(id: string): void {
  }

  /**
   * Updates an unsigned encounter.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateEncounter(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Creates an encounter from an appointment.
   * @param appointmentId Request value for this operation.
   */
  public createEncounterFromAppointment(appointmentId: string): void {
  }

  /**
   * Signs an encounter.
   * @param id Request value for this operation.
   */
  public signEncounter(id: string): void {
  }

  /**
   * Adds an amendment to a signed encounter.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public amendEncounter(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Gets vital signs for an encounter.
   * @param id Request value for this operation.
   */
  public getVitalSigns(id: string): void {
  }

  /**
   * Updates vital signs for an encounter.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateVitalSigns(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Lists diagnoses for an encounter.
   * @param id Request value for this operation.
   */
  public listDiagnoses(id: string): void {
  }

  /**
   * Adds an ICD-10 diagnosis to an encounter.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public addDiagnosis(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Removes a diagnosis from an encounter.
   * @param id Request value for this operation.
   * @param diagnosisId Request value for this operation.
   */
  public removeDiagnosis(id: string, diagnosisId: string): void {
  }

  /**
   * Lists treatment plans for an encounter.
   * @param id Request value for this operation.
   */
  public listTreatmentPlans(id: string): void {
  }

  /**
   * Adds a treatment plan to an encounter.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public addTreatmentPlan(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Updates a treatment plan.
   * @param id Request value for this operation.
   * @param planId Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateTreatmentPlan(id: string, planId: string, payload: Record<string, unknown>): void {
  }

  /**
   * Searches ICD-10 codes.
   * @param query Request value for this operation.
   */
  public searchIcd10(query: string): void {
  }

  /**
   * Lists encounter history for a patient.
   * @param patientId Request value for this operation.
   */
  public listPatientEncounters(patientId: string): void {
  }
}
