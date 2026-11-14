import { Module } from "@nestjs/common";
import { AuthModule } from '@features/auth';
import { IdentityModule } from '@features/identity';
import { OrganizationModule } from '@features/organization';
import { PatientsModule } from '@features/patients';
import { SchedulingModule } from '@features/scheduling';
import { EncountersModule } from '@features/encounters';
import { ClinicalWorkflowsModule } from '@features/clinical-workflows';
import { BillingModule } from '@features/billing';
import { InventoryModule } from '@features/inventory';
@Module({
  imports: [AuthModule,
      IdentityModule,
      OrganizationModule,
      PatientsModule,
      SchedulingModule,
      EncountersModule,
      ClinicalWorkflowsModule,
      BillingModule,
      InventoryModule,],
  controllers: [],
  providers: [],
})
export class FeaturesModule {}