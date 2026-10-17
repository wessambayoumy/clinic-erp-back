import { IsUUID } from 'class-validator';

/**
 * Body for POST /patients/:id/merge. `:id` in the path is the surviving
 * (target) chart; sourcePatientId is folded into it and its history kept.
 */
export class MergePatientsDto {
  /** Patient chart that will be folded into the surviving target chart. */
  @IsUUID()
  sourcePatientId!: string;
}
