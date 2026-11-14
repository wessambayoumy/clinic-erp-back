import { IsOptional, IsUUID } from 'class-validator';

/**
 * Body for POST /eligibility/check — queues a clearinghouse check via BullMQ
 * and returns a check ID immediately; poll GET /eligibility/:checkId.
 */
export class CheckEligibilityDto {
  /** Insurance policy to verify against the clearinghouse. */
  @IsUUID()
  insurancePolicyId!: string;

  /** Appointment the check is being run for, when applicable. */
  @IsOptional()
  @IsUUID()
  appointmentId?: string;
}
