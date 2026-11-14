import { Module } from "@nestjs/common";
import { EventsModule } from "./events";
import { HealthModule } from "./health";
import { ObservabilityModule,AuthenticationModule,AuthorizationModule } from "./modules";

const modules = [
  AuthenticationModule,
  AuthorizationModule,
  HealthModule,
  ObservabilityModule,
  EventsModule,
];

@Module({
  imports: modules,
  exports: modules,
  controllers: [],
  providers: [],
})
export class CommonModules {}
