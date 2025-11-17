import { User } from '../../domain/entities/user.entity';

export interface ITokenService {
  generateAccessToken(user: User): string;
  generateRefreshToken(user: User): string;
  verifyRefreshToken(token: string): any | null;
  verifyStoredRefreshToken(token: string, hashedToken: string): Promise<boolean>;
}
