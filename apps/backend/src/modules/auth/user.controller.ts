import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DeleteUser, SaveUser, User } from '@sdd/auth';
import type { SaveUserIn } from '@sdd/auth';
import { BcryptCryptoProvider } from './crypto.provider';
import { PrismaUserRepository } from './user.prisma';

type UserResponse = {
  id: string;
  name: string;
  email: string;
};

type SaveUserBody = Omit<SaveUserIn, 'id'>;

@Controller('users')
export class UserController {
  constructor(
    private readonly userRepository: PrismaUserRepository,
    private readonly cryptoProvider: BcryptCryptoProvider,
  ) {}

  @Get()
  async list(
    @Query('page') pageParam?: string,
    @Query('perPage') perPageParam?: string,
  ): Promise<{
    items: UserResponse[];
    page: number;
    perPage: number;
    total: number;
  }> {
    const page = Math.max(1, Number(pageParam) || 1);
    const perPage = Math.max(1, Number(perPageParam) || 10);
    const result = await this.userRepository.findPage({ page, perPage });

    return {
      items: result.items.map((user) => this.mapUser(user)),
      page: result.page,
      perPage: result.perPage,
      total: result.total,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);

    if (user === null) {
      throw new NotFoundException('user.not_found');
    }

    return this.mapUser(user);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: SaveUserBody): Promise<void> {
    const useCase = new SaveUser(this.userRepository, this.cryptoProvider);
    await useCase.execute(body);
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() body: SaveUserBody): Promise<void> {
    const useCase = new SaveUser(this.userRepository, this.cryptoProvider);
    await useCase.execute({ ...body, id });
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    const useCase = new DeleteUser(this.userRepository);
    await useCase.execute({ id });
  }

  private mapUser(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
