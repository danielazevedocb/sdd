import { DomainError, RequiredRule, EmailRule, StrongPasswordRule, PersonNameRule, MinLengthRule, MaxLengthRule, Validator } from "@sdd/shared";
import { User } from "../model";
import { CryptoProvider } from "../provider/crypto.provider";
import { UserRepository } from "../provider/user.repository";

export interface RegisterUserIn {
  name: string;
  email: string;
  password: string;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoProvider: CryptoProvider,
  ) {}

  async execute(input: RegisterUserIn): Promise<void> {
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
      {
        code: "user.password",
        value: input.password,
        rules: [new RequiredRule(), new StrongPasswordRule()],
      },
    ]);

    const existing = await this.userRepository.findByEmail(input.email);

    if (existing !== null) {
      throw new DomainError("Email already registered", 409);
    }

    const hashedPassword = await this.cryptoProvider.hashPassword(input.password);

    const user = new User({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    user.validate();

    await this.userRepository.create(user);
  }
}
