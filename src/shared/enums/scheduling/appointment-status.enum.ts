/**
 * Lifecycle status of a booked appointment.
 */
export enum AppointmentStatusEnum {
  /** Booked but not yet confirmed by the patient. */
  SCHEDULED = 'scheduled',
  /** Confirmed by the patient or front desk. */
  CONFIRMED = 'confirmed',
  /** Patient has arrived and checked in. */
  CHECKED_IN = 'checked_in',
  /** Provider has started seeing the patient. */
  IN_PROGRESS = 'in_progress',
  /** Visit finished successfully. */
  COMPLETED = 'completed',
  /** Patient did not attend the appointment. */
  NO_SHOW = 'no_show',
  /** Appointment cancelled before the visit. */
  CANCELLED = 'cancelled',
}
