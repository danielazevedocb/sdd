import { DomainError, ValidationException } from "@sdd/shared";
import { User } from "../../../src/user/model/user.entity";
import { LoginUser, LoginUserIn } from "../../../src/user/usecase/login-user.usecase";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

// FakeCryptoProvider.hashPassword always returns this hash.
// To simulate a wrong-password scenario, store a user with a DIFFERENT hash.
const CORRECT_HASH = "$2b$10$abcdefghijklmnopqrstuuVGmSFMQJeJBFrRNOUTmNRy8a1TNOhxq";
const WRONG_HASH = "$2b$10$zzzzzzzzzzzzzzzzzzzzzzVGmSFMQJeJBFrRNOUTmNRy8a1TNOhxq";

function makeValidInput(overrides: Partial<LoginUserIn> = {}): LoginUserIn {
  return {
    email: "john@example.com",
    password: "AnyPassword123",
    ...overrides,
  };
}

function makeExistingUser(password = CORRECT_HASH): User {
  return new User({
    name: "John Doe",
    email: "john@example.com",
    password,
  });
}

function getErrorCodes(e: ValidationException): string[] {
  return e.errors.map((err) => err.message);
}

describe("LoginUser", () => {
  let userRepository: FakeUserRepository;
  let cryptoProvider: FakeCryptoProvider;
  let useCase: LoginUser;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    cryptoProvider = new FakeCryptoProvider();
    useCase = new LoginUser(userRepository, cryptoProvider);
  });

  describe("happy path", () => {
    it("should return id, name and email on valid login", async () => {
      userRepository.seed([makeExistingUser()]);

      const result = await useCase.execute(makeValidInput());

      expect(result).toMatchObject({
        name: "John Doe",
        email: "john@example.com",
      });
      expect(typeof result.id).toBe("string");
    });

    it("should NOT include password in the return value", async () => {
      userRepository.seed([makeExistingUser()]);

      const result = await useCase.execute(makeValidInput());

      expect(result).not.toHaveProperty("password");
    });
  });

  describe("invalid credentials", () => {
    it("should throw DomainError 401 when email does not exist", async () => {
      await expect(
        useCase.execute(makeValidInput({ email: "unknown@example.com" })),
      ).rejects.toMatchObject({ statusCode: 401, message: "user.credentials.invalid" });
    });

    it("should throw DomainError 401 when password is incorrect", async () => {
      // Store user with a hash that will NOT match the fake hash for any input
      userRepository.seed([makeExistingUser(WRONG_HASH)]);

      await expect(
        useCase.execute(makeValidInput()),
      ).rejects.toMatchObject({ statusCode: 401, message: "user.credentials.invalid" });
    });

    it("should use same error message for missing user and wrong password (no email enumeration)", async () => {
      userRepository.seed([makeExistingUser(WRONG_HASH)]);

      const notFoundError = await useCase.execute(makeValidInput({ email: "unknown@example.com" })).catch((e) => e);
      const wrongPasswordError = await useCase.execute(makeValidInput()).catch((e) => e);

      expect(notFoundError).toBeInstanceOf(DomainError);
      expect(wrongPasswordError).toBeInstanceOf(DomainError);
      expect(notFoundError.message).toBe(wrongPasswordError.message);
    });
  });

  describe("input validation", () => {
    it("should throw ValidationException when email is empty", async () => {
      await expect(
        useCase.execute(makeValidInput({ email: "" })),
      ).rejects.toBeInstanceOf(ValidationException);
    });

    it("should throw ValidationException when email is invalid", async () => {
      try {
        await useCase.execute(makeValidInput({ email: "not-an-email" }));
        expect(true).toBe(false);
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

    it("should not call repository when validation fails", async () => {
      const findSpy = jest.spyOn(userRepository, "findByEmail");

      await expect(
        useCase.execute(makeValidInput({ email: "" })),
      ).rejects.toBeInstanceOf(ValidationException);

      expect(findSpy).not.toHaveBeenCalled();
    });
  });
});
