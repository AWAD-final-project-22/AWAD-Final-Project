import { User } from '../../domain/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export abstract class ITokenService {
  abstract generateAccessToken(user: User): string;
  abstract generateRefreshToken(user: User): string;
  abstract verifyRefreshToken(token: string): JwtPayload | null;
  abstract verifyStoredRefreshToken(
    token: string,
    hashedToken: string,
  ): Promise<boolean>;
}
