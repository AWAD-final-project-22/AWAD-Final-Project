import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/entities/user.entity';
import { ITokenService } from '../../application/ports/token.port';
import { IPasswordService } from '../../application/ports/password.port';

@Injectable()
export class TokenServiceImpl implements ITokenService {
  constructor(
    private jwtService: JwtService,
    private passwordService: IPasswordService,
  ) {}

  generateAccessToken(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    return accessToken;
  }

  generateRefreshToken(user: User) {
    const payload = { sub: user.id, email: user.email };

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return refreshToken;
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      return null;
    }
  }

  async verifyStoredRefreshToken(token: string, hashedToken: string) {
    return await this.passwordService.comparePassword(token, hashedToken);
  }
}
