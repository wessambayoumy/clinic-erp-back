import { Controller } from '@nestjs/common';
import { BillingService } from './billing.service';

/** Handles HTTP requests for the billing feature. */
@Controller('billing')
export class BillingController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly billingService: BillingService) {}

  /**
   * Lists the priced service catalog.
   */
  public listServices(): void {
  }

  /**
   * Creates a priced service.
   * @param payload Request value for this operation.
   */
  public createService(payload: Record<string, unknown>): void {
  }

  /**
   * Gets a priced service by identifier.
   * @param id Request value for this operation.
   */
  public getService(id: string): void {
  }

  /**
   * Updates a priced service.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateService(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Lists invoices using the supplied pagination and filters.
   * @param query Request value for this operation.
   */
  public listInvoices(query: Record<string, unknown>): void {
  }

  /**
   * Creates a draft invoice.
   * @param payload Request value for this operation.
   */
  public createInvoice(payload: Record<string, unknown>): void {
  }

  /**
   * Gets an invoice by identifier.
   * @param id Request value for this operation.
   */
  public getInvoice(id: string): void {
  }

  /**
   * Updates a draft invoice.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateInvoice(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Creates invoice lines from an encounter.
   * @param encounterId Request value for this operation.
   */
  public createInvoiceFromEncounter(encounterId: string): void {
  }

  /**
   * Consolidates department invoices into one statement.
   * @param payload Request value for this operation.
   */
  public consolidateInvoices(payload: Record<string, unknown>): void {
  }

  /**
   * Finalizes an invoice.
   * @param id Request value for this operation.
   */
  public finalizeInvoice(id: string): void {
  }

  /**
   * Voids a finalized invoice.
   * @param id Request value for this operation.
   */
  public voidInvoice(id: string): void {
  }

  /**
   * Gets the printable invoice representation.
   * @param id Request value for this operation.
   */
  public getInvoicePdf(id: string): void {
  }

  /**
   * Lists payments for an invoice.
   * @param invoiceId Request value for this operation.
   */
  public listPayments(invoiceId: string): void {
  }

  /**
   * Records a payment for an invoice.
   * @param invoiceId Request value for this operation.
   * @param payload Request value for this operation.
   */
  public recordPayment(invoiceId: string, payload: Record<string, unknown>): void {
  }

  /**
   * Starts an online card payment.
   * @param payload Request value for this operation.
   */
  public createStripePaymentIntent(payload: Record<string, unknown>): void {
  }

  /**
   * Handles a Stripe payment event.
   * @param payload Request value for this operation.
   */
  public handleStripeWebhook(payload: Record<string, unknown>): void {
  }
}
