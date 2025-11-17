import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/entities/user.entity';
import type { ITokenService } from '../../application/ports/token.port';
import type { IPasswordService } from '../../application/ports/password.port';

@Injectable()
export class TokenService implements ITokenService {
    constructor(
        private jwtService: JwtService,
        @Inject('PasswordService') private passwordService: IPasswordService,
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