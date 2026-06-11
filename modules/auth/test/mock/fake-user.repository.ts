import { PageResult } from "@sdd/shared";
import { User, UserPageParams, UserRepository } from "../../src/user";

export class FakeUserRepository implements UserRepository {
  private items: User[] = [];

  async create(entity: User): Promise<User> {
    this.items.push(entity);
    return entity;
  }

  async update(entity: User): Promise<User> {
    const index = this.items.findIndex((u) => u.id === entity.id);
    if (index >= 0) {
      this.items[index] = entity;
    }
    return entity;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((u) => u.id !== id);
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((u) => u.email === email) ?? null;
  }

  async findPage(params: UserPageParams): Promise<PageResult<User>> {
    const { page, perPage } = params;
    const start = (page - 1) * perPage;
    const items = this.items.slice(start, start + perPage);
    return { items, page, perPage, total: this.items.length };
  }

  seed(users: User[]): void {
    this.items = [...users];
  }

  all(): User[] {
    return [...this.items];
  }
}
