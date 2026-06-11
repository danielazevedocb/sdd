import { UseCase } from "@sdd/shared";
import { UserRepository } from "../provider/user.repository";

export interface DeleteUserIn {
  id: string;
}

export class DeleteUser implements UseCase<DeleteUserIn, void> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeleteUserIn): Promise<void> {
    await this.userRepository.delete(input.id);
  }
}
