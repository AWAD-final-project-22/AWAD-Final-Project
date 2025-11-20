import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Controllers } from './controllers';
import { Guards } from './guards';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApplicationModule } from '../application/application.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [
    ApplicationModule,
    InfrastructureModule, // Import infra to get access to the exported JwtModule
  ],
  controllers: [...Controllers],
  providers: [
    ...Guards,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class PresentationModule {}
