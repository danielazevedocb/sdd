import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '../../db/db.module';
import { AuthController } from './auth.controller';
import { BcryptCryptoProvider } from './crypto.provider';
import { UserController } from './user.controller';
import { PrismaUserRepository } from './user.prisma';

@Module({
  imports: [DbModule, ConfigModule],
  controllers: [AuthController, UserController],
  providers: [PrismaUserRepository, BcryptCryptoProvider],
})
export class AuthModule {}
