export interface CryptoProvider {
  hashPassword(password: string): Promise<string>;
  comparePasswords(plain: string, hashed: string): Promise<boolean>;
}
