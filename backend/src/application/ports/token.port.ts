import { User } from '../../domain/entities/user.entity';

export abstract class ITokenService {
  abstract generateAccessToken(user: User): string;
  abstract generateRefreshToken(user: User): string;
  abstract verifyRefreshToken(token: string): any | null;
  abstract verifyStoredRefreshToken(
    token: string,
    hashedToken: string,
  ): Promise<boolean>;
}
