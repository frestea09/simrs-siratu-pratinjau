import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, LoginDto, User } from './users.types';

@Injectable()
export class UsersService {
  private users: User[] = [];

  create(dto: CreateUserDto): User {
    const user: User = { id: Date.now().toString(), ...dto };
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  update(id: string, dto: UpdateUserDto): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, dto);
    return user;
  }

  remove(id: string): void {
    this.users = this.users.filter((u) => u.id !== id);
  }

  login(dto: LoginDto): User | undefined {
    return this.users.find(
      (u) => u.email === dto.email && u.password === dto.password,
    );
  }
}
