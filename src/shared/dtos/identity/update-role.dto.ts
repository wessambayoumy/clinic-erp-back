import { PartialType } from '@nestjs/mapped-types';

import { CreateRoleDto } from './create-role.dto';

/**
 * Body for PATCH /roles/:id.
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
