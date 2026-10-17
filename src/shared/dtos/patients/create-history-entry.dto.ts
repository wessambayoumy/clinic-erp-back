import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /patients/:id/histories.
 */
export class CreateHistoryEntryDto {
  /** Category of the history entry. */
  @IsString()
  category!: string;

  /** Free-text description of the history entry. */
  @IsString()
  description!: string;

  /** Date the entry occurred. */
  @IsOptional()
  @IsDateString()
  occurredOn?: string;
}
