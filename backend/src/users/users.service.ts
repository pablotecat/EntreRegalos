import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  findAllActiveExcept(excludeUserId: string): Promise<User[]> {
    return this.usersRepository.findAllActiveExcept(excludeUserId);
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.usersRepository.create(data);
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.usersRepository.update(id, data);
  }

  async createPasswordResetToken(userId: string) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    const token = await this.usersRepository.createPasswordResetToken(userId, expiresAt);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return { ...token, resetUrl: `${frontendUrl}/reset-password?token=${token.token}` };
  }

  async findActivePasswordResetTokens() {
    const tokens = await this.usersRepository.findActivePasswordResetTokens();
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return tokens.map((t) => ({
      ...t,
      resetUrl: `${frontendUrl}/reset-password?token=${t.token}`,
    }));
  }
}
