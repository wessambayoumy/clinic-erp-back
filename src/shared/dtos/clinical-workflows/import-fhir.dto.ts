import { IsEnum, IsObject } from 'class-validator';

import { FhirResourceTypeEnum } from '../../enums';

/**
 * Body for POST /interop/fhir/import.
 */
export class ImportFhirDto {
  /** FHIR resource type of the supplied payload. */
  @IsEnum(FhirResourceTypeEnum)
  resourceType!: FhirResourceTypeEnum;

  /** Raw FHIR resource payload to import. */
  @IsObject()
  payload!: Record<string, unknown>;
}
