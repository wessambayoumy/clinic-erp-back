import { Controller } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';

/** Handles HTTP requests for the scheduling feature. */
@Controller('scheduling')
export class SchedulingController {
  /** Creates the controller and injects its feature service. */
  constructor(private readonly schedulingService: SchedulingService) {}

  /**
   * Lists appointments.
   * @param query Request value for this operation.
   */
  public listAppointments(query: Record<string, unknown>): void {
  }

  /**
   * Books an appointment.
   * @param payload Request value for this operation.
   */
  public createAppointment(payload: Record<string, unknown>): void {
  }

  /**
   * Gets an appointment.
   * @param id Request value for this operation.
   */
  public getAppointment(id: string): void {
  }

  /**
   * Updates appointment details.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateAppointment(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Cancels an appointment.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public cancelAppointment(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Marks an appointment as checked in.
   * @param id Request value for this operation.
   */
  public checkInAppointment(id: string): void {
  }

  /**
   * Marks an appointment as a no-show.
   * @param id Request value for this operation.
   */
  public markAppointmentNoShow(id: string): void {
  }

  /**
   * Reschedules an appointment.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public rescheduleAppointment(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Gets the calendar for a date range.
   * @param query Request value for this operation.
   */
  public getCalendar(query: Record<string, unknown>): void {
  }

  /**
   * Gets available appointment slots.
   * @param query Request value for this operation.
   */
  public getAvailability(query: Record<string, unknown>): void {
  }

  /**
   * Gets a provider weekly schedule.
   * @param providerId Request value for this operation.
   */
  public getProviderSchedule(providerId: string): void {
  }

  /**
   * Updates a provider weekly schedule.
   * @param providerId Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateProviderSchedule(providerId: string, payload: Record<string, unknown>): void {
  }

  /**
   * Lists bookable resources.
   * @param query Request value for this operation.
   */
  public listResources(query: Record<string, unknown>): void {
  }

  /**
   * Creates a bookable resource.
   * @param payload Request value for this operation.
   */
  public createResource(payload: Record<string, unknown>): void {
  }

  /**
   * Gets a bookable resource.
   * @param id Request value for this operation.
   */
  public getResource(id: string): void {
  }

  /**
   * Updates a bookable resource.
   * @param id Request value for this operation.
   * @param payload Request value for this operation.
   */
  public updateResource(id: string, payload: Record<string, unknown>): void {
  }

  /**
   * Removes a bookable resource.
   * @param id Request value for this operation.
   */
  public deleteResource(id: string): void {
  }

  /**
   * Lists schedule blocks.
   * @param query Request value for this operation.
   */
  public listScheduleBlocks(query: Record<string, unknown>): void {
  }

  /**
   * Creates a schedule block.
   * @param payload Request value for this operation.
   */
  public createScheduleBlock(payload: Record<string, unknown>): void {
  }
}
