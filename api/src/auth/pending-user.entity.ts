import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * 이메일 인증 대기 중인 회원가입 정보
 */
@Entity('pending_user')
export class PendingUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // 해시된 비밀번호

  @Column()
  name: string;

  @Column({ unique: true })
  nickname: string;

  @Column()
  verificationCode: string;

  @Column()
  codeExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
