import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isDeleted: false },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDeleted: false },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isDeleted: false },
    });
  }

  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, isDeleted: false },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { googleId, isDeleted: false },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async createGoogleUser(userData: {
    email: string;
    nickname: string;
    username: string;
    googleId: string;
    profilePicture?: string;
  }): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      provider: 'google',
    });
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    return (result.affected ?? 0) > 0;
  }

  async hardDelete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async restore(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      isDeleted: false,
      deletedAt: undefined,
    });
    return (result.affected ?? 0) > 0;
  }

  async findDeleted(): Promise<User[]> {
    return this.userRepository.find({
      where: { isDeleted: true },
    });
  }

  async findDeletedById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDeleted: true },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { id, isDeleted: false },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return this.userRepository.count({
      where: { isDeleted: false },
    });
  }
}
