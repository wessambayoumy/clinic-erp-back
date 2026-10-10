import { Controller } from '@nestjs/common';
import { ClinicalWorkflowsService } from './clinical-workflows.service';

/** Handles HTTP requests for the clinical-workflows feature. */
@Controller('clinical-workflows')
export class ClinicalWorkflowsController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly clinicalWorkflowsService: ClinicalWorkflowsService) {}

  /**
   * Lists form templates.
   * @param query Request value for this operation.
   */
  public listFormTemplates(query: Record<string, unknown>): void {
  }

  /**
   * Creates a form template.
   * @param payload Request value for this operation.
   */
  public createFormTemplate(payload: Record<string, unknown>): void {
  }

  /**
   * Gets a form template.
   * @param id Request value for this operation.
   */
  public getFormTemplate(id: string): void {
  }

  /**
   * Updates a form template.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateFormTemplate(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Publishes a form template version.
   * @param id Request value for this operation.
   */
  public publishFormTemplate(id: string): void {
  }

  /**
   * Lists versions of a form template.
   * @param id Request value for this operation.
   */
  public listFormTemplateVersions(id: string): void {
  }

  /**
   * Creates a form submission for an encounter.
   * @param encounterId Request value for this operation.
   * @param payload Request value for this operation.
   */
  public createFormSubmission(encounterId: string, payload: Record<string, unknown>): void {
  }

  /**
   * Gets an encounter form submission.
   * @param encounterId Request value for this operation.
   * @param submissionId Request value for this operation.
   */
  public getFormSubmission(encounterId: string, submissionId: string): void {
  }

  /**
   * Updates an encounter form submission.
   * @param encounterId Request value for this operation.
   * @param submissionId Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateFormSubmission(encounterId: string, submissionId: string, payload: Record<string, unknown>): void {
  }

  /**
   * Creates an imaging study record.
   * @param payload Request value for this operation.
   */
  public createImagingStudy(payload: Record<string, unknown>): void {
  }

  /**
   * Gets imaging study metadata and processing status.
   * @param id Request value for this operation.
   */
  public getImagingStudy(id: string): void {
  }

  /**
   * Creates a short-lived imaging viewer token.
   * @param id Request value for this operation.
   */
  public createImagingViewerToken(id: string): void {
  }

  /**
   * Lists imaging studies for a patient.
   * @param patientId Request value for this operation.
   */
  public listPatientImagingStudies(patientId: string): void {
  }

  /**
   * Creates an outbound fax record.
   * @param payload Request value for this operation.
   */
  public sendFax(payload: Record<string, unknown>): void {
  }

  /**
   * Lists fax records.
   * @param query Request value for this operation.
   */
  public listFaxes(query: Record<string, unknown>): void {
  }

  /**
   * Gets a fax record.
   * @param id Request value for this operation.
   */
  public getFax(id: string): void {
  }

  /**
   * Handles a fax-provider callback.
   * @param payload Request value for this operation.
   */
  public handleFaxWebhook(payload: Record<string, unknown>): void {
  }

  /**
   * Imports external HL7 data.
   * @param payload Request value for this operation.
   */
  public importHl7(payload: Record<string, unknown>): void {
  }

  /**
   * Imports external FHIR data.
   * @param payload Request value for this operation.
   */
  public importFhir(payload: Record<string, unknown>): void {
  }

  /**
   * Gets a patient record for FHIR exchange.
   * @param id Request value for this operation.
   */
  public getFhirPatient(id: string): void {
  }

  /**
   * Gets an encounter record for FHIR exchange.
   * @param id Request value for this operation.
   */
  public getFhirEncounter(id: string): void {
  }

  /**
   * Gets the status or content of an export job.
   * @param id Request value for this operation.
   */
  public getInteropExport(id: string): void {
  }
}
