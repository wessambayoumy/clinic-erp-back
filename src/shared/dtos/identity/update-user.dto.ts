import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

/**
 * Body for PATCH /users/:id.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
