import { ValidationException } from "@sdd/shared";
import { User, UserState } from "../../../src/user/model/user.entity";

function makeValidState(overrides: Partial<UserState> = {}): UserState {
  return {
    name: "John Doe",
    email: "john@example.com",
    password: "$2b$10$abcdefghijklmnopqrstuuVGmSFMQJeJBFrRNOUTmNRy8a1TNOhxq",
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

describe("User entity", () => {
  describe("creation", () => {
    it("should create a valid user entity", () => {
      const state = makeValidState();
      const user = new User(state);

      expect(user.id).toBeDefined();
      expect(user.name).toBe(state.name);
      expect(user.email).toBe(state.email);
      expect(user.password).toBe(state.password);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.deletedAt).toBeNull();
    });

    it("should accept a provided id", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const user = new User(makeValidState({ id }));
      expect(user.id).toBe(id);
    });

    it("should accept provided timestamps", () => {
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const updatedAt = new Date("2024-02-01T00:00:00Z");
      const user = new User(makeValidState({ createdAt, updatedAt }));
      expect(user.createdAt).toEqual(createdAt);
      expect(user.updatedAt).toEqual(updatedAt);
    });

    it("should accept a deletedAt date", () => {
      const deletedAt = new Date("2024-03-01T00:00:00Z");
      const user = new User(makeValidState({ deletedAt }));
      expect(user.deletedAt).toEqual(deletedAt);
    });
  });

  describe("lazy validation", () => {
    it("should not throw on construction with invalid fields", () => {
      expect(() => new User(makeValidState({ name: "" }))).not.toThrow();
      expect(() => new User(makeValidState({ email: "not-an-email" }))).not.toThrow();
      expect(() => new User(makeValidState({ password: "plaintext" }))).not.toThrow();
    });
  });

  describe("validate()", () => {
    it("should not throw for a valid user", () => {
      const user = new User(makeValidState());
      expect(() => user.validate()).not.toThrow();
    });

    describe("name", () => {
      it("should fail when name is empty", () => {
        const user = new User(makeValidState({ name: "" }));
        const codes = getErrorCodes(() => user.validate());
        expect(codes).toContain("user.name.required");
      });

      it("should fail when name is too short (1 char)", () => {
        const user = new User(makeValidState({ name: "J" }));
        const codes = getErrorCodes(() => user.validate());
        expect(codes).toContain("user.name.min.length");
      });

      it("should fail when name is too long (121 chars)", () => {
        const longName = "Jo".padEnd(62, "a") + " " + "Doe".padEnd(60, "a");
        const user = new User(makeValidState({ name: longName }));
        const codes = getErrorCodes(() => user.validate());
        expect(codes).toContain("user.name.max.length");
      });

      it("should fail when name has only one word", () => {
        const user = new User(makeValidState({ name: "John" }));
        const codes = getErrorCodes(() => user.validate());
        expect(codes).toContain("user.name.person.name");
      });

      it("should accept a two-word name", () => {
        const user = new User(makeValidState({ name: "Maria Silva" }));
        expect(() => user.validate()).not.toThrow();
      });
    });

    describe("email", () => {
      it("should fail when email is empty", () => {
        const user = new User(makeValidState({ email: "" }));
        const codes = getErrorCodes(() => user.validate());
        expect(codes).toContain("user.email.required");
      });

      it("should fail when email format is invalid", () => {
        const user = new User(makeValidState({ email: "not-an-email" }));
        const codes = getErrorCodes(() => user.validate());
        expect(codes).toContain("user.email.invalid.email");
      });

      it("should accept a valid email", () => {
        const user = new User(makeValidState({ email: "user@domain.com" }));
        expect(() => user.validate()).not.toThrow();
      });
    });

    describe("password", () => {
      it("should fail when password is empty", () => {
        const user = new User(makeValidState({ password: "" }));
        const codes = getErrorCodes(() => user.validate());
        expect(codes).toContain("user.password.required");
      });

      it("should fail when password is not a bcrypt hash", () => {
        const user = new User(makeValidState({ password: "plaintext123" }));
        const codes = getErrorCodes(() => user.validate());
        expect(codes).toContain("user.password.bcrypt.hash");
      });

      it("should accept a valid bcrypt hash", () => {
        const hash = "$2b$10$abcdefghijklmnopqrstuuVGmSFMQJeJBFrRNOUTmNRy8a1TNOhxq";
        const user = new User(makeValidState({ password: hash }));
        expect(() => user.validate()).not.toThrow();
      });
    });
  });

  describe("clone()", () => {
    it("should clone the entity with updated fields", () => {
      const user = new User(makeValidState());
      const cloned = user.clone({ name: "Jane Doe" });

      expect(cloned.name).toBe("Jane Doe");
      expect(cloned.email).toBe(user.email);
      expect(cloned.id).toBe(user.id);
      expect(cloned.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
    });
  });

  describe("equals()", () => {
    it("should return true for entities with same id", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const a = new User(makeValidState({ id }));
      const b = new User(makeValidState({ id }));
      expect(a.equals(b)).toBe(true);
    });

    it("should return false for entities with different ids", () => {
      const a = new User(makeValidState());
      const b = new User(makeValidState());
      expect(a.equals(b)).toBe(false);
    });

    it("should return false when comparing with null", () => {
      const user = new User(makeValidState());
      expect(user.equals(null)).toBe(false);
    });
  });
});
