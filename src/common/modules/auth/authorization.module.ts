import { Module } from '@nestjs/common';
import { AbilityGuard } from '@common/guards/authorization';
import { AbilityFactory } from '@common/services/authorization';
import { APP_GUARD } from '@nestjs/core';

@Module({
  // providers: [],
  providers: [AbilityFactory, { provide: APP_GUARD, useClass: AbilityGuard }],
  exports: [AbilityFactory],
})
export class AuthorizationModule {}
