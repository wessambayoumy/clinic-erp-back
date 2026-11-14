import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateProviderDto } from './create-provider.dto';

/**
 * Body for PATCH /providers/:id. userId is immutable after creation.
 */
export class UpdateProviderDto extends PartialType(
  OmitType(CreateProviderDto, ['userId']),
) {}
