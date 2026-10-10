import { SetMetadata } from '@nestjs/common';

export interface CheckAbilityParams {
  action: string;
  subject: string;
}

export const CHECK_ABILITY_KEY = 'check_ability';

export const CheckAbility = (...requirements: CheckAbilityParams[]) =>
  SetMetadata(CHECK_ABILITY_KEY, requirements);
