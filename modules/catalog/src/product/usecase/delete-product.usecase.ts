import { DomainError, UseCase } from "@sdd/shared";
import { ProductRepository } from "../provider/product.repository";

export interface DeleteProductIn {
  id: string;
}

export class DeleteProduct implements UseCase<DeleteProductIn, void> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: DeleteProductIn): Promise<void> {
    const existing = await this.productRepository.findById(input.id);

    if (existing === null) {
      throw new DomainError("product.not_found", 404);
    }

    await this.productRepository.delete(input.id);
  }
}
