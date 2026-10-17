import { IsInt, IsString, Max, Min } from 'class-validator';

/**
 * One weekly working-hours slot, nested inside UpdateProviderScheduleDto.
 */
export class ProviderAvailabilitySlotDto {
  /** Day of the week, where 0 is Sunday and 6 is Saturday. */
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  /** Local start time of the slot, for example `09:00`. */
  @IsString()
  startTime!: string;

  /** Local end time of the slot, for example `17:00`. */
  @IsString()
  endTime!: string;
}
