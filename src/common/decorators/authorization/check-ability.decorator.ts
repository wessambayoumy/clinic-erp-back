import { SetMetadata } from '@nestjs/common';

import { CHECK_ABILITY_KEY } from '@/shared/constants/authorization';
import type { ICheckAbilityParams } from '@/shared/interfaces/authorization';

export const CheckAbility = (...requirements: ICheckAbilityParams[]) =>
  SetMetadata(CHECK_ABILITY_KEY, requirements);
