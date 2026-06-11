import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DeleteProduct, Product, ProductStatus, SaveProduct } from '@sdd/catalog';
import type { SaveProductIn } from '@sdd/catalog';
import { PrismaProductRepository } from './product.prisma';

type ProductResponse = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  availableOnline: boolean;
  featured: boolean;
  allowsPreOrder: boolean;
};

type SaveProductBody = Omit<SaveProductIn, 'id'>;

@Controller('products')
export class ProductController {
  constructor(private readonly productRepository: PrismaProductRepository) {}

  @Get()
  async list(
    @Query('page') pageParam?: string,
    @Query('perPage') perPageParam?: string,
  ): Promise<{
    items: ProductResponse[];
    page: number;
    perPage: number;
    total: number;
  }> {
    const page = Math.max(1, Number(pageParam) || 1);
    const perPage = Math.max(1, Number(perPageParam) || 10);
    const result = await this.productRepository.findPage({ page, perPage });

    return {
      items: result.items.map((product) => this.mapProduct(product)),
      page: result.page,
      perPage: result.perPage,
      total: result.total,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);

    if (product === null) {
      throw new NotFoundException('product.not_found');
    }

    return this.mapProduct(product);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: SaveProductBody): Promise<void> {
    const useCase = new SaveProduct(this.productRepository);
    await useCase.execute(body);
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() body: SaveProductBody): Promise<void> {
    const useCase = new SaveProduct(this.productRepository);
    await useCase.execute({ ...body, id });
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    const useCase = new DeleteProduct(this.productRepository);
    await useCase.execute({ id });
  }

  private mapProduct(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      status: product.status,
      availableOnline: product.availableOnline,
      featured: product.featured,
      allowsPreOrder: product.allowsPreOrder,
    };
  }
}
