import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { ITokenService } from '../../../application/ports/token.port';
import { IPasswordService } from '../../../application/ports/password.port';
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(email: string, password: string) {
    const user: User | null = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new InvalidCredentialsError();
    }

    const isValidPassword = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    const refreshTokenHash =
      await this.passwordService.hashPassword(refreshToken);
    await this.userRepository.updateRefreshToken(user.id, refreshTokenHash);

    return { accessToken, refreshToken };
  }
}
