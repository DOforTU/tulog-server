import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User, AuthProvider } from './user.entity';
import { UpdateUserDto } from './user.dto';

/** Google OAuth 사용자 데이터 인터페이스 */
interface GoogleUserData {
  googleId: string;
  email: string;
  nickname: string;
  username: string;
  profilePicture?: string;
}

/**
 * 사용자 비즈니스 로직 서비스
 * - 사용자 CRUD 작업
 * - Google OAuth 사용자 관리
 * - Soft Delete 기능
 * - 데이터 유효성 검증
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // ===== 기본 CRUD - 도메인 명시 =====

  /** 모든 활성 사용자 조회 */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  /** ID로 사용자 조회 (예외 발생) */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /** 사용자 생성 */
  async createUser(userData: GoogleUserData): Promise<User> {
    // 삭제되지 않은 사용자의 이메일 중복 체크만 수행
    const existingActiveUser = await this.userRepository.findByEmail(
      userData.email,
    );
    if (existingActiveUser) {
      throw new ConflictException('Email already exists');
    }

    return this.userRepository.createGoogleUser(userData);
  }

  /** 사용자 정보 업데이트 */
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

  /** 사용자 소프트 삭제 */
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

  // ===== 조회 메서드 - 도메인 명시 =====

  /** 이메일로 사용자 조회 (예외 발생) */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /** Google ID로 사용자 조회 */
  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findByGoogleId(googleId);
  }

  /** 삭제된 사용자 목록 조회 */
  async getDeletedUsers(): Promise<User[]> {
    return this.userRepository.findDeleted();
  }

  /** 활성 사용자 수 조회 */
  async getUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  // ===== 비즈니스 로직 - 동사 중심 =====

  /** 사용자 영구 삭제 */
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

  /** 삭제된 사용자 복구 */
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

  /** Google OAuth 사용자 생성 */
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

  /** 기존 계정에 Google 계정 연동 */
  async linkGoogleAccount(
    userId: number,
    linkData: { googleId: string; profilePicture?: string },
  ): Promise<User> {
    const updateData = {
      googleId: linkData.googleId,
      profilePicture: linkData.profilePicture,
      provider: AuthProvider.GOOGLE,
    };

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundException(
        `Failed to link Google account for user ${userId}`,
      );
    }

    return updatedUser;
  }

  // ===== 내부 헬퍼 메서드 - 간단한 형태 =====

  /** 이메일로 활성 사용자 조회 (nullable) */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /** ID로 활성 사용자 조회 (nullable) */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /** 이메일로 사용자 조회 (삭제된 사용자 포함) */
  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return this.userRepository.findByEmailIncludingDeleted(email);
  }

  /** Google ID로 사용자 조회 */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findByGoogleId(googleId);
  }
}

// TODO: 소셜 로그인 제공자 확장 (카카오, 네이버 등)
// TODO: 사용자 프로필 이미지 업로드 처리
// TODO: 사용자 권한 관리 시스템 구현
// TODO: 계정 잠금/해제 기능 추가
// TODO: 사용자 활동 로그 기록 기능
// TODO: 사용자 검색 및 필터링 기능 추가
// TODO: 다중 소셜 계정 연동 기능 (구글 + 카카오 등)
