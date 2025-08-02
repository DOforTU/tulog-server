import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auth } from './auth.entity';
import { CreateAuthDto } from './auth.dto';
import { User } from 'src/user/user.entity';

/**
 * User Data Access Layer (Repository Pattern)
 * - Database CRUD operations using TypeORM
 * - Soft Delete support
 * - Google OAuth user creation support
 */
@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  /** Create auth */
  async createAuth(authData: CreateAuthDto, user: User): Promise<Auth> {
    const auth = this.authRepository.create({ ...authData, user: user });
    return this.authRepository.save(auth);
  }

  /** Find auth by UserId(NOT Auth Id) */
  async findByUserId(userId: number): Promise<Auth | null> {
    return this.authRepository.findOne({
      where: {
        user: { id: userId },
      },
    });
  }
}
