import { Module } from '@nestjs/common';
import { ClinicalWorkflowsController } from './clinical-workflows.controller';
import { ClinicalWorkflowsService } from './clinical-workflows.service';

@Module({
  controllers: [ClinicalWorkflowsController],
  providers: [ClinicalWorkflowsService],
})
/** Registers the HTTP and application providers for clinical-workflows. */
export class ClinicalWorkflowsModule {}
