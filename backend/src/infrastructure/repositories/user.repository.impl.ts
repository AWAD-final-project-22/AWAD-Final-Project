import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../database/prisma.service';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { email } });
    if (!u) return null;
    return UserMapper.toDomain(u);
  }

  async findById(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) return null;
    return UserMapper.toDomain(u);
  }

  async create(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    const u = await this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        password: data.password,
        name: data.name,
        provider: data.provider,
        refreshToken: data.refreshToken,
      },
    });

    return UserMapper.toDomain(u);
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { refreshToken } });
  }
}
