import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { AuthUseCaseProviders } from './use-cases/auth';
import { GmailUseCaseProviders } from './use-cases/gmail';

@Module({
  imports: [InfrastructureModule],
  providers: [
    ...AuthUseCaseProviders,
    ...GmailUseCaseProviders,
  ],
  exports: [
    ...AuthUseCaseProviders.map((p) => p.provide),
    ...GmailUseCaseProviders.map((p) => p.provide),
  ],
})
export class ApplicationModule {}
