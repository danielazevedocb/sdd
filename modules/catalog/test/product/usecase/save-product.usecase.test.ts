import { ValidationException } from "@sdd/shared";
import { Product, ProductStatus } from "../../../src/product/model/product.entity";
import { SaveProduct, SaveProductIn } from "../../../src/product/usecase/save-product.usecase";
import { FakeProductRepository } from "../../mock";

function makeValidInput(overrides: Partial<SaveProductIn> = {}): SaveProductIn {
  return {
    name: "Produto Teste",
    description: "Descrição",
    price: 29.9,
    status: ProductStatus.Active,
    ...overrides,
  };
}

function makeExistingProduct(overrides: Partial<ProductStateLike> = {}): Product {
  return new Product({
    name: "Produto Existente",
    description: null,
    price: 10,
    status: ProductStatus.Draft,
    availableOnline: false,
    featured: false,
    allowsPreOrder: false,
    ...overrides,
  });
}

type ProductStateLike = {
  id?: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  availableOnline: boolean;
  featured: boolean;
  allowsPreOrder: boolean;
};

function getErrorCodes(e: ValidationException): string[] {
  return e.errors.map((err) => err.message);
}

describe("SaveProduct", () => {
  let productRepository: FakeProductRepository;
  let useCase: SaveProduct;

  beforeEach(() => {
    productRepository = new FakeProductRepository();
    useCase = new SaveProduct(productRepository);
  });

  describe("create", () => {
    it("should create a product successfully", async () => {
      await useCase.execute(makeValidInput());

      const products = productRepository.all();
      expect(products).toHaveLength(1);
      expect(products[0].name).toBe("Produto Teste");
      expect(products[0].price).toBe(29.9);
      expect(products[0].status).toBe(ProductStatus.Active);
    });

    it("should default boolean flags to false on create", async () => {
      await useCase.execute(makeValidInput());

      const product = productRepository.all()[0];
      expect(product.availableOnline).toBe(false);
      expect(product.featured).toBe(false);
      expect(product.allowsPreOrder).toBe(false);
    });

    it("should persist null description when absent", async () => {
      await useCase.execute(makeValidInput({ description: undefined }));

      expect(productRepository.all()[0].description).toBeNull();
    });

    it("should create with provided id when it does not exist yet", async () => {
      const id = "11111111-1111-4111-8111-111111111111";

      await useCase.execute(makeValidInput({ id }));

      expect(productRepository.all()[0].id).toBe(id);
    });

    it("should return void on create", async () => {
      const result = await useCase.execute(makeValidInput());
      expect(result).toBeUndefined();
    });

    it("should throw ValidationException when name is too short", async () => {
      await expect(useCase.execute(makeValidInput({ name: "A" }))).rejects.toBeInstanceOf(
        ValidationException,
      );
    });

    it("should throw ValidationException when price is negative", async () => {
      await expect(useCase.execute(makeValidInput({ price: -1 }))).rejects.toBeInstanceOf(
        ValidationException,
      );
    });

    it("should throw ValidationException when status is invalid", async () => {
      await expect(
        useCase.execute(makeValidInput({ status: "invalid" as ProductStatus })),
      ).rejects.toBeInstanceOf(ValidationException);
    });
  });

  describe("update", () => {
    it("should update an existing product", async () => {
      const existing = makeExistingProduct();
      productRepository.seed([existing]);

      await useCase.execute(
        makeValidInput({
          id: existing.id,
          name: "Produto Atualizado",
          price: 49.5,
          status: ProductStatus.Inactive,
        }),
      );

      const updated = productRepository.all()[0];
      expect(updated.name).toBe("Produto Atualizado");
      expect(updated.price).toBe(49.5);
      expect(updated.status).toBe(ProductStatus.Inactive);
    });

    it("should keep boolean flags when omitted on update", async () => {
      const existing = makeExistingProduct({
        availableOnline: true,
        featured: true,
        allowsPreOrder: true,
      });
      productRepository.seed([existing]);

      await useCase.execute(
        makeValidInput({
          id: existing.id,
          name: "Produto Atualizado",
        }),
      );

      const updated = productRepository.all()[0];
      expect(updated.availableOnline).toBe(true);
      expect(updated.featured).toBe(true);
      expect(updated.allowsPreOrder).toBe(true);
    });

    it("should create when id is provided but product does not exist", async () => {
      const id = "22222222-2222-4222-8222-222222222222";

      await useCase.execute(makeValidInput({ id }));

      expect(productRepository.all()).toHaveLength(1);
      expect(productRepository.all()[0].id).toBe(id);
    });
  });
});
