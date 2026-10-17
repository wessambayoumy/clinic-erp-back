import { IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Body for POST /fax/send.
 */
export class SendFaxDto {
  /** Destination fax number. */
  @IsString()
  toNumber!: string;

  /** Patient the fax relates to. */
  @IsOptional()
  @IsUUID()
  patientId?: string;

  /** Encounter the fax relates to. */
  @IsOptional()
  @IsUUID()
  encounterId?: string;

  /** Document attached to the fax. */
  @IsOptional()
  @IsUUID()
  documentId?: string;
}
