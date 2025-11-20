import { User } from '../entities/user.entity';

export abstract class IUserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract create(user: User): Promise<User>;
  abstract updateRefreshToken(id: string, refreshToken: string): Promise<void>;
}
