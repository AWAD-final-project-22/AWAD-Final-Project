import { User as DomainUser } from '../../domain/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): DomainUser {
    return new DomainUser({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password ?? undefined,
      name: prismaUser.name ?? undefined,
      provider: prismaUser.provider as 'local' | 'google',
      refreshToken: prismaUser.refreshToken ?? undefined,
    });
  }

  static toPersistence(domainUser: DomainUser): PrismaUser {
    // In a real scenario, you might return a Partial<PrismaUser> or a specific
    // input type for Prisma creation if not all fields match 1:1.
    // Here we cast or map manually.
    return {
      id: domainUser.id,
      email: domainUser.email,
      password: domainUser.password ?? null,
      name: domainUser.name ?? null,
      provider: domainUser.provider,
      refreshToken: domainUser.refreshToken ?? null,
      createdAt: new Date(), // or handle appropriately
      updatedAt: new Date(), // or handle appropriately
    };
  }
}
