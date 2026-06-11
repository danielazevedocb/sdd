import { DomainError, ValidationException } from "@sdd/shared";
import { User } from "../../../src/user/model/user.entity";
import { RegisterUser, RegisterUserIn } from "../../../src/user/usecase/register-user.usecase";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

function makeValidInput(overrides: Partial<RegisterUserIn> = {}): RegisterUserIn {
  return {
    name: "John Doe",
    email: "john@example.com",
    password: "Secure@1234",
    ...overrides,
  };
}

function makeExistingUser(): User {
  return new User({
    name: "John Doe",
    email: "john@example.com",
    password: "$2b$10$abcdefghijklmnopqrstuuVGmSFMQJeJBFrRNOUTmNRy8a1TNOhxq",
  });
}

function getErrorCodes(e: ValidationException): string[] {
  return e.errors.map((err) => err.message);
}

describe("RegisterUser", () => {
  let userRepository: FakeUserRepository;
  let cryptoProvider: FakeCryptoProvider;
  let useCase: RegisterUser;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    cryptoProvider = new FakeCryptoProvider();
    useCase = new RegisterUser(userRepository, cryptoProvider);
  });

  describe("happy path", () => {
    it("should register a user successfully", async () => {
      await useCase.execute(makeValidInput());

      const users = userRepository.all();
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe("John Doe");
      expect(users[0].email).toBe("john@example.com");
    });

    it("should store the hashed password (not plain text)", async () => {
      await useCase.execute(makeValidInput());

      const users = userRepository.all();
      expect(users[0].password).not.toBe("Secure@1234");
      expect(users[0].password).toMatch(/^\$2b\$/);
    });

    it("should return void", async () => {
      const result = await useCase.execute(makeValidInput());
      expect(result).toBeUndefined();
    });
  });

  describe("input validation", () => {
    it("should throw ValidationException when name is empty", async () => {
      await expect(
        useCase.execute(makeValidInput({ name: "" })),
      ).rejects.toBeInstanceOf(ValidationException);
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

    it("should throw ValidationException when email is empty", async () => {
      await expect(
        useCase.execute(makeValidInput({ email: "" })),
      ).rejects.toBeInstanceOf(ValidationException);
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

    it("should throw ValidationException when password is empty", async () => {
      await expect(
        useCase.execute(makeValidInput({ password: "" })),
      ).rejects.toBeInstanceOf(ValidationException);
    });

    it("should throw ValidationException when password is weak", async () => {
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
  });

  describe("duplicate email", () => {
    it("should throw DomainError with 409 when email is already registered", async () => {
      userRepository.seed([makeExistingUser()]);

      try {
        await useCase.execute(makeValidInput({ email: "john@example.com" }));
        fail("Expected error not thrown");
      } catch (e) {
        if (e instanceof DomainError) {
          expect(e.statusCode).toBe(409);
        } else {
          throw e;
        }
      }
    });

    it("should not call cryptoProvider when email already exists", async () => {
      userRepository.seed([makeExistingUser()]);
      const hashSpy = jest.spyOn(cryptoProvider, "hashPassword");

      await expect(
        useCase.execute(makeValidInput({ email: "john@example.com" })),
      ).rejects.toBeInstanceOf(DomainError);

      expect(hashSpy).not.toHaveBeenCalled();
    });

    it("should not persist user when email already exists", async () => {
      userRepository.seed([makeExistingUser()]);
      const initialCount = userRepository.all().length;

      await expect(
        useCase.execute(makeValidInput({ email: "john@example.com" })),
      ).rejects.toBeInstanceOf(DomainError);

      expect(userRepository.all()).toHaveLength(initialCount);
    });
  });
});
