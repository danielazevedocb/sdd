import { User } from "../../../src/user/model/user.entity";
import { DeleteUser } from "../../../src/user/usecase/delete-user.usecase";
import { FakeUserRepository } from "../../mock";

describe("DeleteUser", () => {
  it("should delete the user when it exists", async () => {
    const user = new User({
      name: "Joao Silva",
      email: "joao@silva.com",
      password: "$2b$10$abcdefghijklmnopqrstuuVGmSFMQJeJBFrRNOUTmNRy8a1TNOhxq",
    });
    const userRepository = new FakeUserRepository();
    userRepository.seed([user]);
    const useCase = new DeleteUser(userRepository);

    await expect(useCase.execute({ id: user.id })).resolves.toBeUndefined();
    await expect(userRepository.findById(user.id)).resolves.toBeNull();
  });

  it("should remain predictable when the id does not exist", async () => {
    const userRepository = new FakeUserRepository();
    const useCase = new DeleteUser(userRepository);

    await expect(useCase.execute({ id: "missing-id" })).resolves.toBeUndefined();
    expect(userRepository.all()).toEqual([]);
  });
});
