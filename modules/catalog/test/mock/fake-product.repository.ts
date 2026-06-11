import { PageResult } from "@sdd/shared";
import { Product, ProductPageParams, ProductRepository } from "../../src/product";

export class FakeProductRepository implements ProductRepository {
  private items: Product[] = [];

  async create(entity: Product): Promise<Product> {
    this.items.push(entity);
    return entity;
  }

  async update(entity: Product): Promise<Product> {
    const index = this.items.findIndex((item) => item.id === entity.id);
    if (index >= 0) {
      this.items[index] = entity;
    }
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findPage(params: ProductPageParams): Promise<PageResult<Product>> {
    const { page, perPage } = params;
    const start = (page - 1) * perPage;
    const items = this.items.slice(start, start + perPage);
    return { items, page, perPage, total: this.items.length };
  }

  seed(products: Product[]): void {
    this.items = [...products];
  }

  all(): Product[] {
    return [...this.items];
  }
}
