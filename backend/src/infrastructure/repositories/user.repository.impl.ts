import { Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { email } });
    if (!u) return null;
    const user = new User();
    user.id = u.id;
    user.email = u.email;
    user.password = u.password ?? undefined;
    user.name = u.name ?? undefined;
    user.provider = u.provider as 'local' | 'google';
    user.refreshToken = u.refreshToken ?? undefined;
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) return null;
    const user = new User();
    user.id = u.id;
    user.email = u.email;
    user.password = u.password ?? undefined;
    user.name = u.name ?? undefined;
    user.provider = u.provider as 'local' | 'google';
    user.refreshToken = u.refreshToken ?? undefined;
    return user;
  }

  async create(user: User): Promise<User> {
    const u = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        provider: user.provider,
        refreshToken: user.refreshToken,
      },
    });
    const created = new User();
    created.id = u.id;
    created.email = u.email;
    created.password = u.password ?? undefined;
    created.name = u.name ?? undefined;
    created.provider = u.provider as 'local' | 'google';
    created.refreshToken = u.refreshToken ?? undefined;
    return created;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { refreshToken } });
  }
}
