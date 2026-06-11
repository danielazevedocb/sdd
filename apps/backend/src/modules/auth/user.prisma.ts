import { Injectable } from '@nestjs/common';
import { PageResult } from '@sdd/shared';
import { User, UserPageParams, UserRepository } from '@sdd/auth';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: User): Promise<User> {
    await this.prisma.user.create({
      data: {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        password: entity.password,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      },
    });

    return entity;
  }

  async update(entity: User): Promise<User> {
    await this.prisma.user.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        email: entity.email,
        password: entity.password,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      },
    });

    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async findPage(params: UserPageParams): Promise<PageResult<User>> {
    const { page, perPage } = params;
    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: perPage }),
      this.prisma.user.count(),
    ]);

    return {
      items: items.map((r) => this.toDomain(r)),
      page,
      perPage,
      total,
    };
  }

  private toDomain(record: {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): User {
    return new User({
      id: record.id,
      name: record.name,
      email: record.email,
      password: record.password,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }
}
