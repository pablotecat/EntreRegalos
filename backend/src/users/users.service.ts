import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.usersRepository.create(data);
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.usersRepository.update(id, data);
  }
}
