import { PartialType } from '@nestjs/swagger';

import { CreateRoleDto } from './create-role.dto';

/**
 * Body for PATCH /roles/:id.
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
