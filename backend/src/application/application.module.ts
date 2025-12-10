import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { AuthUseCaseProviders } from './use-cases/auth';
import { GmailUseCaseProviders } from './use-cases/gmail';
import { WorkflowUseCaseProviders } from './use-cases/workflow';

@Module({
  imports: [InfrastructureModule],
  providers: [
    ...AuthUseCaseProviders,
    ...GmailUseCaseProviders,
    ...WorkflowUseCaseProviders,
  ],
  exports: [
    ...AuthUseCaseProviders.map((p) => p.provide),
    ...GmailUseCaseProviders.map((p) => p.provide),
    ...WorkflowUseCaseProviders.map((p) => p.provide),
  ],
})
export class ApplicationModule {}
