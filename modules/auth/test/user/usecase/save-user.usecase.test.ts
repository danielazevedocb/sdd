import { DomainError, ValidationException } from "@sdd/shared";
import { User } from "../../../src/user/model/user.entity";
import { SaveUser, SaveUserIn } from "../../../src/user/usecase/save-user.usecase";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

function makeValidInput(overrides: Partial<SaveUserIn> = {}): SaveUserIn {
  return {
    name: "John Doe",
    email: "john@example.com",
    password: "Secure@1234",
    ...overrides,
  };
}

function makeExistingUser(overrides: Partial<{ id: string; name: string; email: string; password: string }> = {}): User {
  return new User({
    name: "Existing User",
    email: "existing@example.com",
    password: "$2b$10$abcdefghijklmnopqrstuuVGmSFMQJeJBFrRNOUTmNRy8a1TNOhxq",
    ...overrides,
  });
}

function getErrorCodes(e: ValidationException): string[] {
  return e.errors.map((err) => err.message);
}

describe("SaveUser", () => {
  let userRepository: FakeUserRepository;
  let cryptoProvider: FakeCryptoProvider;
  let useCase: SaveUser;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    cryptoProvider = new FakeCryptoProvider();
    useCase = new SaveUser(userRepository, cryptoProvider);
  });

  describe("create", () => {
    it("should create a user successfully", async () => {
      await useCase.execute(makeValidInput());

      const users = userRepository.all();
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe("John Doe");
      expect(users[0].email).toBe("john@example.com");
    });

    it("should create a user with a provided id when it does not exist yet", async () => {
      const id = "11111111-1111-4111-8111-111111111111";

      await useCase.execute(makeValidInput({ id }));

      const users = userRepository.all();
      expect(users[0].id).toBe(id);
    });

    it("should hash the password on create", async () => {
      await useCase.execute(makeValidInput());

      const users = userRepository.all();
      expect(users[0].password).not.toBe("Secure@1234");
      expect(users[0].password).toMatch(/^\$2b\$/);
    });

    it("should return void on create", async () => {
      const result = await useCase.execute(makeValidInput());
      expect(result).toBeUndefined();
    });

    it("should throw DomainError with 409 when email is already registered", async () => {
      userRepository.seed([makeExistingUser({ email: "john@example.com" })]);

      await expect(useCase.execute(makeValidInput())).rejects.toBeInstanceOf(DomainError);
    });

    it("should throw ValidationException when password is omitted on create", async () => {
      await expect(
        useCase.execute({
          name: "John Doe",
          email: "missing-pass@example.com",
        }),
      ).rejects.toBeInstanceOf(ValidationException);
    });

    it("should create when id is provided but user is not found", async () => {
      await useCase.execute(
        makeValidInput({ id: "22222222-2222-4222-8222-222222222222", email: "new@example.com" }),
      );

      expect(userRepository.all()).toHaveLength(1);
    });
  });

  describe("update", () => {
    it("should update an existing user without changing password when password is absent", async () => {
      const existing = makeExistingUser();
      userRepository.seed([existing]);
      const hashSpy = jest.spyOn(cryptoProvider, "hashPassword");

      await useCase.execute({
        id: existing.id,
        name: "Updated Name",
        email: existing.email,
      });

      const users = userRepository.all();
      expect(users[0].name).toBe("Updated Name");
      expect(users[0].password).toBe(existing.password);
      expect(hashSpy).not.toHaveBeenCalled();
    });

    it("should update an existing user without changing password when password is empty", async () => {
      const existing = makeExistingUser();
      userRepository.seed([existing]);
      const hashSpy = jest.spyOn(cryptoProvider, "hashPassword");

      await useCase.execute({
        id: existing.id,
        name: "Updated Name",
        email: existing.email,
        password: "",
      });

      const users = userRepository.all();
      expect(users[0].password).toBe(existing.password);
      expect(hashSpy).not.toHaveBeenCalled();
    });

    it("should hash a new password when provided on update", async () => {
      const existing = makeExistingUser();
      userRepository.seed([existing]);
      const hashSpy = jest.spyOn(cryptoProvider, "hashPassword");

      await useCase.execute({
        id: existing.id,
        name: existing.name,
        email: existing.email,
        password: "NewSecure@5678",
      });

      expect(hashSpy).toHaveBeenCalledWith("NewSecure@5678");
    });

    it("should update email when the new email is available", async () => {
      const existing = makeExistingUser();
      userRepository.seed([existing]);

      await useCase.execute({
        id: existing.id,
        name: existing.name,
        email: "new-email@example.com",
      });

      expect(userRepository.all()[0].email).toBe("new-email@example.com");
    });

    it("should throw DomainError with 409 when email is already used by another user", async () => {
      const existing = makeExistingUser();
      const other = makeExistingUser({ email: "other@example.com" });
      userRepository.seed([existing, other]);

      await expect(
        useCase.execute({
          id: existing.id,
          name: existing.name,
          email: "other@example.com",
        }),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it("should allow keeping the same email on update", async () => {
      const existing = makeExistingUser();
      userRepository.seed([existing]);

      await useCase.execute({
        id: existing.id,
        name: "Updated Name",
        email: existing.email,
      });

      expect(userRepository.all()[0].name).toBe("Updated Name");
    });
  });

  describe("input validation", () => {
    it("should throw ValidationException when name is empty", async () => {
      await expect(useCase.execute(makeValidInput({ name: "" }))).rejects.toBeInstanceOf(ValidationException);
    });

    it("should throw ValidationException with user.name.required code when name is empty", async () => {
      try {
        await useCase.execute(makeValidInput({ name: "" }));
        fail("Expected error not thrown");
      } catch (e) {
        if (e instanceof ValidationException) {
          expect(getErrorCodes(e)).toContain("user.name.required");
        } else {
          throw e;
        }
      }
    });

    it("should throw ValidationException when name has only one word", async () => {
      try {
        await useCase.execute(makeValidInput({ name: "John" }));
        fail("Expected error not thrown");
      } catch (e) {
        if (e instanceof ValidationException) {
          expect(getErrorCodes(e)).toContain("user.name.person.name");
        } else {
          throw e;
        }
      }
    });

    it("should throw ValidationException when email is invalid", async () => {
      try {
        await useCase.execute(makeValidInput({ email: "not-an-email" }));
        fail("Expected error not thrown");
      } catch (e) {
        if (e instanceof ValidationException) {
          expect(getErrorCodes(e)).toContain("user.email.invalid.email");
        } else {
          throw e;
        }
      }
    });

    it("should throw ValidationException when password is missing on create", async () => {
      try {
        await useCase.execute(makeValidInput({ password: "" }));
        fail("Expected error not thrown");
      } catch (e) {
        if (e instanceof ValidationException) {
          expect(getErrorCodes(e)).toContain("user.password.required");
        } else {
          throw e;
        }
      }
    });

    it("should throw ValidationException when password is weak on create", async () => {
      try {
        await useCase.execute(makeValidInput({ password: "weak" }));
        fail("Expected error not thrown");
      } catch (e) {
        if (e instanceof ValidationException) {
          expect(getErrorCodes(e)).toContain("user.password.strong.password");
        } else {
          throw e;
        }
      }
    });

    it("should throw ValidationException when password is weak on update", async () => {
      const existing = makeExistingUser();
      userRepository.seed([existing]);

      try {
        await useCase.execute({
          id: existing.id,
          name: existing.name,
          email: existing.email,
          password: "weak",
        });
        fail("Expected error not thrown");
      } catch (e) {
        if (e instanceof ValidationException) {
          expect(getErrorCodes(e)).toContain("user.password.strong.password");
        } else {
          throw e;
        }
      }
    });
  });
});
