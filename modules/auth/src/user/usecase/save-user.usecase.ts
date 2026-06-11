import {
  DomainError,
  EmailRule,
  MaxLengthRule,
  MinLengthRule,
  PersonNameRule,
  RequiredRule,
  StrongPasswordRule,
  Validator,
} from "@sdd/shared";
import { User } from "../model";
import { CryptoProvider } from "../provider/crypto.provider";
import { UserRepository } from "../provider/user.repository";

export interface SaveUserIn {
  id?: string;
  name: string;
  email: string;
  password?: string;
}

export class SaveUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoProvider: CryptoProvider,
  ) {}

  async execute(input: SaveUserIn): Promise<void> {
    Validator.validate([
      {
        code: "user.name",
        value: input.name,
        rules: [new RequiredRule(), new MinLengthRule(2), new MaxLengthRule(120), new PersonNameRule()],
      },
      {
        code: "user.email",
        value: input.email,
        rules: [new RequiredRule(), new EmailRule()],
      },
    ]);

    const existing = input.id ? await this.userRepository.findById(input.id) : null;

    if (existing !== null) {
      await this.updateUser(existing, input);
      return;
    }

    await this.createUser(input);
  }

  private async updateUser(existing: User, input: SaveUserIn): Promise<void> {
    const hasNewPassword = input.password !== undefined && input.password.trim() !== "";

    if (hasNewPassword) {
      Validator.validate([
        {
          code: "user.password",
          value: input.password,
          rules: [new RequiredRule(), new StrongPasswordRule()],
        },
      ]);
    }

    if (input.email !== existing.email) {
      const duplicate = await this.userRepository.findByEmail(input.email);

      if (duplicate !== null) {
        throw new DomainError("Email already registered", 409);
      }
    }

    const password = hasNewPassword
      ? await this.cryptoProvider.hashPassword(input.password!)
      : existing.password;

    const user = existing.clone({
      name: input.name,
      email: input.email,
      password,
    });

    user.validate();
    await this.userRepository.update(user);
  }

  private async createUser(input: SaveUserIn): Promise<void> {
    Validator.validate([
      {
        code: "user.password",
        value: input.password ?? "",
        rules: [new RequiredRule(), new StrongPasswordRule()],
      },
    ]);

    const duplicate = await this.userRepository.findByEmail(input.email);

    if (duplicate !== null) {
      throw new DomainError("Email already registered", 409);
    }

    const hashedPassword = await this.cryptoProvider.hashPassword(input.password!);
    const user = new User({
      id: input.id,
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    user.validate();
    await this.userRepository.create(user);
  }
}
