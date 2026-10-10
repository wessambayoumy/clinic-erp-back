import { Module } from '@nestjs/common';
import { AbilityGuard } from './guards/authorization/ability.guard';
import { AbilityFactory } from './services/authorization/ability.factory';

@Module({
  providers: [AbilityFactory, AbilityGuard],
  exports: [AbilityFactory, AbilityGuard],
})
export class AuthorizationModule {}
