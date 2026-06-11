import { Injectable } from '@nestjs/common';
import { PageResult } from '@sdd/shared';
import { Product, ProductPageParams, ProductRepository } from '@sdd/catalog';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: Product): Promise<Product> {
    await this.prisma.product.create({
      data: {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        price: new Prisma.Decimal(entity.price),
        status: entity.status,
        availableOnline: entity.availableOnline,
        featured: entity.featured,
        allowsPreOrder: entity.allowsPreOrder,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      },
    });

    return entity;
  }

  async update(entity: Product): Promise<Product> {
    await this.prisma.product.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        description: entity.description,
        price: new Prisma.Decimal(entity.price),
        status: entity.status,
        availableOnline: entity.availableOnline,
        featured: entity.featured,
        allowsPreOrder: entity.allowsPreOrder,
        updatedAt: entity.updatedAt,
        deletedAt: entity.deletedAt,
      },
    });

    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findPage(params: ProductPageParams): Promise<PageResult<Product>> {
    const { page, perPage } = params;
    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({ skip, take: perPage }),
      this.prisma.product.count(),
    ]);

    return {
      items: items.map((record) => this.toDomain(record)),
      page,
      perPage,
      total,
    };
  }

  private toDomain(record: {
    id: string;
    name: string;
    description: string | null;
    price: Prisma.Decimal;
    status: string;
    availableOnline: boolean;
    featured: boolean;
    allowsPreOrder: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Product {
    return new Product({
      id: record.id,
      name: record.name,
      description: record.description,
      price: record.price.toNumber(),
      status: record.status as Product['status'],
      availableOnline: record.availableOnline,
      featured: record.featured,
      allowsPreOrder: record.allowsPreOrder,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }
}
