import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { ITokenService } from 'src/application/ports/token.port';
import { IPasswordService } from 'src/application/ports/password.port';

export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService,
    private passwordService: IPasswordService,
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const isValid = await this.tokenService.verifyStoredRefreshToken(
      refreshToken,
      user.refreshToken,
    );

    if (!isValid) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const accessToken = this.tokenService.generateAccessToken(user);

    return {
      accessToken,
      refreshToken: refreshToken,
    };
  }
}
