import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { MockEmailRepositoryImpl } from './repositories/mock-email.repository.impl';
import { PasswordServiceImpl } from './services/password.service';
import { TokenServiceImpl } from './services/token.service';

import { IUserRepository } from '../domain/repositories/user.repository';
import { IEmailRepository } from '../domain/repositories/email.repository';
import { IPasswordService } from '../application/ports/password.port';
import { ITokenService } from '../application/ports/token.port';

@Module({
  imports: [
    // Configure JWT Module properly with ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'changeme',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: IEmailRepository,
      useClass: MockEmailRepositoryImpl,
    },
    {
      provide: IPasswordService,
      useClass: PasswordServiceImpl,
    },
    {
      provide: ITokenService,
      useClass: TokenServiceImpl,
    },
  ],
  exports: [
    PrismaService,
    IUserRepository,
    IEmailRepository,
    IPasswordService,
    ITokenService,
    JwtModule, // Export JwtModule so PresentationModule can use it (via AuthGuard)
  ],
})
export class InfrastructureModule {}
