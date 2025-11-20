import { LoginUseCase } from './login.use-case';
import { RegisterUseCase } from './register.use-case';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { GoogleSignInUseCase } from './google-signin.use-case';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IPasswordService } from '../../ports/password.port';
import { ITokenService } from '../../ports/token.port';

export const AuthUseCaseProviders = [
  {
    provide: LoginUseCase,
    useFactory: (
      userRepo: IUserRepository,
      pwdSvc: IPasswordService,
      tokenSvc: ITokenService,
    ) => new LoginUseCase(userRepo, pwdSvc, tokenSvc),
    inject: [IUserRepository, IPasswordService, ITokenService],
  },
  {
    provide: RegisterUseCase,
    useFactory: (userRepo: IUserRepository, pwdSvc: IPasswordService) =>
      new RegisterUseCase(userRepo, pwdSvc),
    inject: [IUserRepository, IPasswordService],
  },
  {
    provide: RefreshTokenUseCase,
    useFactory: (
      userRepo: IUserRepository,
      tokenSvc: ITokenService,
      pwdSvc: IPasswordService,
    ) => new RefreshTokenUseCase(userRepo, tokenSvc, pwdSvc),
    inject: [IUserRepository, ITokenService, IPasswordService],
  },
  {
    provide: GoogleSignInUseCase,
    useFactory: (
      userRepo: IUserRepository,
      tokenSvc: ITokenService,
      pwdSvc: IPasswordService,
    ) => new GoogleSignInUseCase(userRepo, tokenSvc, pwdSvc),
    inject: [IUserRepository, ITokenService, IPasswordService],
  },
];

export const AuthUseCases = [
  LoginUseCase,
  RegisterUseCase,
  RefreshTokenUseCase,
  GoogleSignInUseCase,
];
