import { IsOptional, IsString } from 'class-validator';

/**
 * Body for POST /interop/hl7/import — raw HL7 message ingestion from an external lab or hospital.
 */
export class ImportHl7Dto {
  /** Raw HL7 message payload. */
  @IsString()
  payload!: string;

  /** Identifier of the external system the message originated from. */
  @IsOptional()
  @IsString()
  sourceSystem?: string;
}
