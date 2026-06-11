import { ValidationException } from "@sdd/shared";
import { Product, ProductState, ProductStatus } from "../../../src/product/model/product.entity";

function makeValidState(overrides: Partial<ProductState> = {}): ProductState {
  return {
    name: "Produto Teste",
    description: "Descrição opcional",
    price: 19.99,
    status: ProductStatus.Active,
    availableOnline: false,
    featured: false,
    allowsPreOrder: false,
    ...overrides,
  };
}

function getErrorCodes(fn: () => void): string[] {
  try {
    fn();
    return [];
  } catch (e) {
    if (e instanceof ValidationException) {
      return e.errors.map((err) => err.message);
    }
    throw e;
  }
}

describe("Product entity", () => {
  describe("creation", () => {
    it("should create a valid product entity", () => {
      const state = makeValidState();
      const product = new Product(state);

      expect(product.id).toBeDefined();
      expect(product.name).toBe(state.name);
      expect(product.description).toBe(state.description);
      expect(product.price).toBe(state.price);
      expect(product.status).toBe(state.status);
      expect(product.availableOnline).toBe(false);
      expect(product.featured).toBe(false);
      expect(product.allowsPreOrder).toBe(false);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
      expect(product.deletedAt).toBeNull();
    });

    it("should accept null description", () => {
      const product = new Product(makeValidState({ description: null }));
      expect(product.description).toBeNull();
    });

    it("should accept boolean flags", () => {
      const product = new Product(
        makeValidState({
          availableOnline: true,
          featured: true,
          allowsPreOrder: true,
        }),
      );

      expect(product.availableOnline).toBe(true);
      expect(product.featured).toBe(true);
      expect(product.allowsPreOrder).toBe(true);
    });
  });

  describe("validate", () => {
    it("should pass validation for valid data", () => {
      const product = new Product(makeValidState());
      expect(() => product.validate()).not.toThrow();
    });

    it("should fail when name is too short", () => {
      const product = new Product(makeValidState({ name: "A" }));
      const codes = getErrorCodes(() => product.validate());
      expect(codes).toContain("product.name.min.length");
    });

    it("should fail when name is too long", () => {
      const product = new Product(makeValidState({ name: "A".repeat(121) }));
      const codes = getErrorCodes(() => product.validate());
      expect(codes).toContain("product.name.max.length");
    });

    it("should fail when description is too long", () => {
      const product = new Product(makeValidState({ description: "A".repeat(501) }));
      const codes = getErrorCodes(() => product.validate());
      expect(codes).toContain("product.description.max.length");
    });

    it("should fail when price is negative", () => {
      const product = new Product(makeValidState({ price: -1 }));
      const codes = getErrorCodes(() => product.validate());
      expect(codes).toContain("product.price.min.value");
    });

    it("should fail when price has more than 2 decimal places", () => {
      const product = new Product(makeValidState({ price: 1.234 }));
      const codes = getErrorCodes(() => product.validate());
      expect(codes).toContain("product.price.precision");
    });

    it("should fail when status is invalid", () => {
      const product = new Product(makeValidState({ status: "archived" as ProductStatus }));
      const codes = getErrorCodes(() => product.validate());
      expect(codes).toContain("product.status.in");
    });

    it("should allow zero price", () => {
      const product = new Product(makeValidState({ price: 0 }));
      expect(() => product.validate()).not.toThrow();
    });

    it("should allow null description without validation errors", () => {
      const product = new Product(makeValidState({ description: null }));
      expect(() => product.validate()).not.toThrow();
    });
  });
});
