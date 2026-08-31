import { Module } from '@nestjs/common';
import { CaslModule } from './casl/casl.module';
import { AbilityGuard } from './guards/ability.guard';

@Module({
  imports: [CaslModule],
  providers: [AbilityGuard],
  exports: [AbilityGuard, CaslModule],
})
export class AuthorizationModule {}
