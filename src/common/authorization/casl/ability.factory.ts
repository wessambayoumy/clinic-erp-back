import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AppAbility } from './ability.types';

// Minimal ability type - can be extended when @casl/ability is installed

@Injectable()
export class AbilityFactory {
  createForUser(user: AuthenticatedUser): AppAbility {
    // Minimal implementation - full CASL integration when package is installed
    const permissions: Record<string, string[]> = {
      user: ['read', 'read:own'],
      admin: ['manage', 'all'],
    };

    const userRoles = user.roles || [];
    const abilities: string[] = [];

    for (const role of userRoles) {
      abilities.push(...(permissions[role] || []));
    }

    return {
      can: (action: string, _subject: string): boolean => {
        // Basic permission check
        if (user.roles?.includes('admin')) {
          return true;
        }
        return abilities.includes(action);
      },
      cannot: (action: string, subject: string): boolean => {
        const ability = this.createForUser(user);
        return !ability.can(action, subject);
      },
    };
  }
}
