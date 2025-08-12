import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingUser } from './pending-user.entity';

@Injectable()
export class PendingUserRepository {
  constructor(
    @InjectRepository(PendingUser)
    private readonly pendingUserRepository: Repository<PendingUser>,
  ) {}

  // ===== CREATE =====

  /**
   * 임시 회원가입 정보 저장
   */
  async create(pendingUserData: Partial<PendingUser>): Promise<PendingUser> {
    const pendingUser = this.pendingUserRepository.create(pendingUserData);
    return await this.pendingUserRepository.save(pendingUser);
  }

  // ===== READ =====

  /**
   * 이메일로 임시 회원가입 정보 조회
   */
  async findByEmail(email: string): Promise<PendingUser | null> {
    return await this.pendingUserRepository.findOne({
      where: { email },
    });
  }

  /**
   * 이메일과 인증코드로 임시 회원가입 정보 조회
   */
  async findByEmailAndCode(
    email: string,
    code: string,
  ): Promise<PendingUser | null> {
    return await this.pendingUserRepository.findOne({
      where: { email, verificationCode: code },
    });
  }

  // ===== DELETE =====

  /**
   * 임시 회원가입 정보 삭제
   */
  async remove(pendingUser: PendingUser): Promise<void> {
    await this.pendingUserRepository.remove(pendingUser);
  }

  /**
   * 만료된 임시 회원가입 정보들 삭제
   */
  async removeExpired(): Promise<void> {
    await this.pendingUserRepository
      .createQueryBuilder()
      .delete()
      .where('codeExpiresAt < :now', { now: new Date() })
      .execute();
  }
}
