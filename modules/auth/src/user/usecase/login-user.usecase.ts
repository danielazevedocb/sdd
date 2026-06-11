import { DomainError, EmailRule, RequiredRule, Validator } from "@sdd/shared";
import { CryptoProvider } from "../provider/crypto.provider";
import { UserRepository } from "../provider/user.repository";

export interface LoginUserIn {
  email: string;
  password: string;
}

export interface LoginUserOut {
  id: string;
  name: string;
  email: string;
}

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoProvider: CryptoProvider,
  ) {}

  async execute(input: LoginUserIn): Promise<LoginUserOut> {
    Validator.validate([
      {
        code: "user.email",
        value: input.email,
        rules: [new RequiredRule(), new EmailRule()],
      },
      {
        code: "user.password",
        value: input.password,
        rules: [new RequiredRule()],
      },
    ]);

    const user = await this.userRepository.findByEmail(input.email);

    if (user === null) {
      throw new DomainError("user.credentials.invalid", 401);
    }

    const isValid = await this.cryptoProvider.comparePasswords(input.password, user.password);

    if (!isValid) {
      throw new DomainError("user.credentials.invalid", 401);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
