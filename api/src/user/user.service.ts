import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

interface GoogleUserData {
  googleId: string;
  email: string;
  nickname: string;
  username: string;
  profilePicture?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return this.userRepository.findByEmailIncludingDeleted(email);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // 비즈니스 로직: 이메일 중복 검사
    const existingUserByEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // 비즈니스 로직: 사용자명 중복 검사
    const existingUserByUsername = await this.userRepository.findByUsername(
      createUserDto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // 비즈니스 로직: 비밀번호 암호화 (여기서는 간단히 처리, 실제로는 bcrypt 사용)
    // TODO: 비밀번호 해싱 로직 추가

    return this.userRepository.create(createUserDto);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // 비즈니스 로직: 사용자 존재 확인
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 비즈니스 로직: 이메일 중복 검사 (다른 사용자와)
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (userWithEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // 비즈니스 로직: 사용자명 중복 검사 (다른 사용자와)
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const userWithUsername = await this.userRepository.findByUsername(
        updateUserDto.username,
      );
      if (userWithUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    // 비즈니스 로직: 사용자 존재 확인
    const userExists = await this.userRepository.exists(id);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new Error(`Failed to delete user with ID ${id}`);
    }
  }

  async hardDeleteUser(id: number): Promise<void> {
    // 비즈니스 로직: 사용자 존재 확인 (삭제된 사용자 포함)
    const user = await this.userRepository.findDeletedById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleted = await this.userRepository.hardDelete(id);
    if (!deleted) {
      throw new Error(`Failed to permanently delete user with ID ${id}`);
    }
  }

  async restoreUser(id: number): Promise<User> {
    // 비즈니스 로직: 삭제된 사용자 존재 확인
    const deletedUser = await this.userRepository.findDeletedById(id);
    if (!deletedUser) {
      throw new NotFoundException(`Deleted user with ID ${id} not found`);
    }

    const restored = await this.userRepository.restore(id);
    if (!restored) {
      throw new Error(`Failed to restore user with ID ${id}`);
    }

    const restoredUser = await this.userRepository.findById(id);
    if (!restoredUser) {
      throw new Error(`Failed to retrieve restored user with ID ${id}`);
    }

    return restoredUser;
  }

  async getDeletedUsers(): Promise<User[]> {
    return this.userRepository.findDeleted();
  }

  async getUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return !user;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.userRepository.findByUsername(username);
    return !user;
  }

  // Google OAuth 관련 메서드들
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findByGoogleId(googleId);
  }

  async createGoogleUser(googleUserData: GoogleUserData): Promise<User> {
    // 삭제되지 않은 사용자의 이메일 중복 체크만 수행
    // 삭제된 사용자는 새로운 계정을 생성할 수 있음
    const existingActiveUser = await this.userRepository.findByEmail(
      googleUserData.email,
    );
    if (existingActiveUser) {
      throw new ConflictException('Email already exists');
    }

    // 삭제된 사용자가 있더라도 새로운 계정을 생성
    return this.userRepository.createGoogleUser(googleUserData);
  }

  async linkGoogleAccount(
    userId: number,
    linkData: { googleId: string; profilePicture?: string },
  ): Promise<User> {
    const updateData = {
      googleId: linkData.googleId,
      profilePicture: linkData.profilePicture,
      provider: 'google',
    };

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundException(
        `Failed to link Google account for user ${userId}`,
      );
    }

    return updatedUser;
  }
}
