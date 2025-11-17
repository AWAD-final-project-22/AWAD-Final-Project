import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/auth/login.use-case';
import { RegisterUseCase } from './application/use-cases/auth/register.use-case';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case';
import { PrismaService } from './infrastructure/database/prisma.service';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { PasswordService } from './infrastructure/services/password.service';
import { TokenService } from './infrastructure/services/token.service';
import { GoogleSignInUseCase } from './application/use-cases/auth/google-signin.use-case';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'changeme',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtAuthGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    PrismaService,
    { provide: LoginUseCase, useFactory: (userRepo, pwdSvc, tokenSvc) => new LoginUseCase(userRepo, pwdSvc, tokenSvc), inject: ['UserRepository', 'PasswordService', 'TokenService'] },
    { provide: RegisterUseCase, useFactory: (userRepo, pwdSvc) => new RegisterUseCase(userRepo, pwdSvc), inject: ['UserRepository', 'PasswordService'] },
    { provide: RefreshTokenUseCase, useFactory: (userRepo, tokenSvc, pwdSvc) => new RefreshTokenUseCase(userRepo, tokenSvc, pwdSvc), inject: ['UserRepository', 'TokenService', 'PasswordService'] },
    { provide: GoogleSignInUseCase, useFactory: (userRepo, tokenSvc, pwdSvc) => new GoogleSignInUseCase(userRepo, tokenSvc, pwdSvc, process.env.GOOGLE_CLIENT_ID ?? ''), inject: ['UserRepository', 'TokenService', 'PasswordService'] },
    { provide: 'UserRepository', useClass: UserRepositoryImpl },
    { provide: 'PasswordService', useClass: PasswordService },
    { provide: 'TokenService', useClass: TokenService },
  ],
})
export class AppModule {}
