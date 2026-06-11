import {
  InRule,
  MaxLengthRule,
  MinLengthRule,
  MinValueRule,
  PrecisionRule,
  RequiredRule,
  Validator,
} from "@sdd/shared";
import { Product, ProductStatus } from "../model";
import { ProductRepository } from "../provider/product.repository";

export interface SaveProductIn {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  status: ProductStatus;
  availableOnline?: boolean;
  featured?: boolean;
  allowsPreOrder?: boolean;
}

export class SaveProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: SaveProductIn): Promise<void> {
    Validator.validate([
      {
        code: "product.name",
        value: input.name,
        rules: [new RequiredRule(), new MinLengthRule(2), new MaxLengthRule(120)],
      },
      {
        code: "product.description",
        value: input.description ?? null,
        rules: [new MaxLengthRule(500)],
      },
      {
        code: "product.price",
        value: input.price,
        rules: [new RequiredRule(), new MinValueRule(0), new PrecisionRule(2)],
      },
      {
        code: "product.status",
        value: input.status,
        rules: [
          new RequiredRule(),
          new InRule([ProductStatus.Active, ProductStatus.Inactive, ProductStatus.Draft]),
        ],
      },
    ]);

    const existing = input.id ? await this.productRepository.findById(input.id) : null;

    if (existing !== null) {
      await this.updateProduct(existing, input);
      return;
    }

    await this.createProduct(input);
  }

  private async updateProduct(existing: Product, input: SaveProductIn): Promise<void> {
    const product = existing.clone({
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      status: input.status,
      availableOnline: input.availableOnline ?? existing.availableOnline,
      featured: input.featured ?? existing.featured,
      allowsPreOrder: input.allowsPreOrder ?? existing.allowsPreOrder,
    });

    product.validate();
    await this.productRepository.update(product);
  }

  private async createProduct(input: SaveProductIn): Promise<void> {
    const product = new Product({
      id: input.id,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      status: input.status,
      availableOnline: input.availableOnline ?? false,
      featured: input.featured ?? false,
      allowsPreOrder: input.allowsPreOrder ?? false,
    });

    product.validate();
    await this.productRepository.create(product);
  }
}
