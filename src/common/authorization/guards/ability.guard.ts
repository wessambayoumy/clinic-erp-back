import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../casl/ability.factory';
import {
  CHECK_ABILITY_KEY,
  CheckAbilityParams,
} from '../decorators/check-ability.decorator';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirements = this.reflector.get<CheckAbilityParams[]>(
      CHECK_ABILITY_KEY,
      context.getHandler(),
    );

    if (!requirements) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const ability = this.abilityFactory.createForUser(user);

    for (const requirement of requirements) {
      if (!ability.can(requirement.action, requirement.subject)) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }
}
