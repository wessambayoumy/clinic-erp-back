import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AppAbility } from './ability.types';

@Injectable()
export class AbilityFactory {
  createForUser(user: AuthenticatedUser): AppAbility {
    const permissions: Record<string, string[]> = {
      admin: ['manage', 'all'],
      provider: [
        'read:patients',
        'manage:encounters',
        'read:scheduling',
        'manage:scheduling',
        'read:imaging',
        'create:imaging',
      ],
      receptionist: [
        'manage:patients',
        'read:scheduling',
        'manage:scheduling',
        'read:providers',
      ],
      billing_officer: [
        'manage:billing',
        'read:encounters',
        'read:patients',
        'read:services',
      ],
      inventory_manager: [
        'manage:inventory',
        'read:suppliers',
        'manage:suppliers',
      ],
      insurance_coordinator: [
        'manage:insurance',
        'read:patients',
        'read:payers',
      ],
    };

    const userRoles = user.roles || [];
    const abilities: string[] = [];

    for (const role of userRoles) {
      abilities.push(...(permissions[role] || []));
    }

    return {
      can: (action: string, _subject: string): boolean => {
        if (user.roles?.includes('admin')) {
          return true;
        }
        return abilities.includes(action) || abilities.includes('manage');
      },
      cannot: (action: string, subject: string): boolean => {
        const ability = this.createForUser(user);
        return !ability.can(action, subject);
      },
    };
  }
}