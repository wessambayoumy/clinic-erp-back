import { PartialType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';

/**
 * Body for PATCH /users/:id.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
