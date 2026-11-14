import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

import { ProviderAvailabilitySlotDto } from './provider-availability-slot.dto';

/**
 * Body for PUT /providers/:id/schedule — replaces the full weekly working-hours template.
 */
export class UpdateProviderScheduleDto {
  /** Weekly working-hours slots that make up the schedule. */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderAvailabilitySlotDto)
  slots!: ProviderAvailabilitySlotDto[];
}
