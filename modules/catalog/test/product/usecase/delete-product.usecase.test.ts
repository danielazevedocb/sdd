import { DomainError } from "@sdd/shared";
import { Product, ProductStatus } from "../../../src/product/model/product.entity";
import { DeleteProduct } from "../../../src/product/usecase/delete-product.usecase";
import { FakeProductRepository } from "../../mock";

describe("DeleteProduct", () => {
  let productRepository: FakeProductRepository;
  let useCase: DeleteProduct;

  beforeEach(() => {
    productRepository = new FakeProductRepository();
    useCase = new DeleteProduct(productRepository);
  });

  it("should delete an existing product", async () => {
    const product = new Product({
      name: "Produto",
      description: null,
      price: 10,
      status: ProductStatus.Active,
      availableOnline: false,
      featured: false,
      allowsPreOrder: false,
    });
    productRepository.seed([product]);

    await useCase.execute({ id: product.id });

    expect(productRepository.all()).toHaveLength(0);
  });

  it("should throw DomainError when product does not exist", async () => {
    await expect(
      useCase.execute({ id: "00000000-0000-4000-8000-000000000000" }),
    ).rejects.toMatchObject({
      message: "product.not_found",
      statusCode: 404,
    });
  });
});
