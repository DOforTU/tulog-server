import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

/**
 * 사용자 데이터 접근 계층 (Repository Pattern)
 * - TypeORM을 사용한 데이터베이스 CRUD 작업
 * - Soft Delete 지원
 * - Google OAuth 사용자 생성 지원
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /** 활성 사용자 전체 조회 */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isDeleted: false },
    });
  }

  /** ID로 활성 사용자 조회 */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDeleted: false },
    });
  }

  /** 이메일로 활성 사용자 조회 */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isDeleted: false },
    });
  }

  /** 이메일로 사용자 조회 (삭제된 사용자 포함) */
  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /** 사용자명으로 활성 사용자 조회 */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, isDeleted: false },
    });
  }

  /** Google ID로 활성 사용자 조회 */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { googleId, isDeleted: false },
    });
  }

  /** 새 사용자 생성 */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /** Google OAuth 사용자 생성 */
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

  /** 사용자 정보 업데이트 */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  /** 사용자 소프트 삭제 */
  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    return (result.affected ?? 0) > 0;
  }

  /** 사용자 영구 삭제 */
  async hardDelete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /** 삭제된 사용자 복구 */
  async restore(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      isDeleted: false,
      deletedAt: undefined,
    });
    return (result.affected ?? 0) > 0;
  }

  /** 삭제된 사용자 전체 조회 */
  async findDeleted(): Promise<User[]> {
    return this.userRepository.find({
      where: { isDeleted: true },
    });
  }

  /** ID로 삭제된 사용자 조회 */
  async findDeletedById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDeleted: true },
    });
  }

  /** 사용자 존재 여부 확인 (활성 사용자만) */
  async exists(id: number): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { id, isDeleted: false },
    });
    return count > 0;
  }

  /** 활성 사용자 수 조회 */
  async count(): Promise<number> {
    return this.userRepository.count({
      where: { isDeleted: false },
    });
  }
}

// TODO: 사용자 검색 기능 추가 (이름, 이메일, 닉네임으로 검색)
// TODO: 페이지네이션 지원 추가
// TODO: 사용자 역할별 조회 기능 추가
// TODO: 최근 로그인 시간 업데이트 기능 추가
// TODO: 사용자 활동 로그 기능 추가
