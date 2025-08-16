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

  // 임시 정보 테이블에서 유저 정보를 가져와서 remove 함 (delete는 데이터만 삭제여서 그런가)

  /**
   * 임시 회원가입 정보 삭제
   */
  async remove(pendingUser: PendingUser): Promise<void> {
    await this.pendingUserRepository.remove(pendingUser);
  }

  /**
   * 만료된 임시 회원가입 정보들 삭제
   *
   * 일단 만료된 정보를 삭제하기 위해 20250815까지 유효기간이면 now보다 전을 조회하고 삭제
   * 여기서는 쿼리빌더인데 이거는 where절만 해주면 되는건가?
   */
  async removeExpired(): Promise<void> {
    await this.pendingUserRepository
      .createQueryBuilder()
      .delete()
      .where('codeExpiresAt < :now', { now: new Date() })
      .execute();
  }
}
