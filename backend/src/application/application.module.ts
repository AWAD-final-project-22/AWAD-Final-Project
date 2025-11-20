import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { AuthUseCaseProviders } from './use-cases/auth';
import { EmailUseCaseProviders } from './use-cases/email';

@Module({
  imports: [InfrastructureModule],
  providers: [...AuthUseCaseProviders, ...EmailUseCaseProviders],
  exports: [
    ...AuthUseCaseProviders.map((p) => p.provide),
    ...EmailUseCaseProviders.map((p) => p.provide),
  ],
})
export class ApplicationModule {}
