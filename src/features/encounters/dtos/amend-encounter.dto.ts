import { IsString } from 'class-validator';

/**
 * Body for POST /encounters/:id/amend — an addendum to a signed record; the original content is never altered.
 */
export class AmendEncounterDto {
  /** Addendum text appended to the signed encounter record. */
  @IsString()
  addendum!: string;
}
