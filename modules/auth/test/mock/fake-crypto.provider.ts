import { CryptoProvider } from "../../src/user/provider/crypto.provider";

export class FakeCryptoProvider implements CryptoProvider {
  async hashPassword(password: string): Promise<string> {
    return `$2b$10$abcdefghijklmnopqrstuuVGmSFMQJeJBFrRNOUTmNRy8a1TNOhxq`;
  }

  async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    const fakeHashed = await this.hashPassword(plain);
    return fakeHashed === hashed;
  }
}
