import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateDepartmentDto } from './create-department.dto';

/**
 * Body for PATCH /departments/:id. locationId is immutable after creation (move the department by creating a new one instead).
 */
export class UpdateDepartmentDto extends PartialType(
  OmitType(CreateDepartmentDto, ['locationId']),
) {}
