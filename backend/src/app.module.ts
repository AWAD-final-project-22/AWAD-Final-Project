import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { AuthController } from './presentation/controllers/auth.controller';
import { EmailController } from './presentation/controllers/email.controller';
import { LoginUseCase } from './application/use-cases/auth/login.use-case';
import { RegisterUseCase } from './application/use-cases/auth/register.use-case';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case';
import { GetMailboxesUseCase } from './application/use-cases/email/get-mailboxes.use-case';
import { GetEmailsUseCase } from './application/use-cases/email/get-emails.use-case';
import { GetEmailDetailUseCase } from './application/use-cases/email/get-email-detail.use-case';
import { PrismaService } from './infrastructure/database/prisma.service';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { PasswordService } from './infrastructure/services/password.service';
import { TokenService } from './infrastructure/services/token.service';
import { GoogleSignInUseCase } from './application/use-cases/auth/google-signin.use-case';
import { MockEmailRepository } from './infrastructure/repositories/mock-email.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'changeme',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController, EmailController],
  providers: [
    JwtAuthGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    PrismaService,
    {
      provide: LoginUseCase,
      useFactory: (userRepo, pwdSvc, tokenSvc) =>
        new LoginUseCase(userRepo, pwdSvc, tokenSvc),
      inject: ['UserRepository', 'PasswordService', 'TokenService'],
    },
    {
      provide: RegisterUseCase,
      useFactory: (userRepo, pwdSvc) => new RegisterUseCase(userRepo, pwdSvc),
      inject: ['UserRepository', 'PasswordService'],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (userRepo, tokenSvc, pwdSvc) =>
        new RefreshTokenUseCase(userRepo, tokenSvc, pwdSvc),
      inject: ['UserRepository', 'TokenService', 'PasswordService'],
    },
    {
      provide: GoogleSignInUseCase,
      useFactory: (userRepo, tokenSvc, pwdSvc) =>
        new GoogleSignInUseCase(userRepo, tokenSvc, pwdSvc),
      inject: ['UserRepository', 'TokenService', 'PasswordService'],
    },
    { provide: 'UserRepository', useClass: UserRepositoryImpl },
    { provide: 'EmailRepository', useClass: MockEmailRepository },
    { provide: 'PasswordService', useClass: PasswordService },
    { provide: 'TokenService', useClass: TokenService },
  ],
})
export class AppModule {}
