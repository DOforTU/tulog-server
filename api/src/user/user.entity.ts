import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum AuthProvider {
  GOOGLE = 'google',
  LOCAL = 'local',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/**
 * 사용자 엔티티
 * - Google OAuth 로그인 지원
 * - Soft Delete 기능 포함
 * - 삭제되지 않은 사용자에 대해서만 이메일/닉네임 unique 제약조건 적용
 */
@Entity('user')
@Index(['email'], { where: '"isDeleted" = false', unique: true })
@Index(['nickname'], { where: '"isDeleted" = false', unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /** 사용자 이메일 (Google OAuth 로그인 시 사용) */
  @Column()
  email: string;

  /** 사용자 실명 (Google 로그인 시 firstName + lastName) */
  @Column({ nullable: true })
  username: string;

  /** 사용자 닉네임 (선택적, 기본값은 이메일 앞부분) */
  @Column()
  nickname: string;

  /** 비밀번호 (LOCAL 로그인 시 사용) */
  @Column({ select: false, nullable: true })
  password: string;

  /** 사용자 권한 (기본값: 일반 사용자) */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  /** Google OAuth ID */
  @Column({ nullable: true })
  googleId: string;

  /** 프로필 사진 URL */
  @Column({ nullable: true })
  profilePicture: string;

  /** 로그인 제공자 (현재는 'google'만 지원) */

  @Column({
    type: 'enum',
    enum: AuthProvider,
  })
  provider: AuthProvider;

  /** 계정 활성화 상태 */
  @Column({ default: true })
  isActive: boolean;

  /** 소프트 삭제 여부 */
  @Column({ default: false })
  isDeleted: boolean;

  /** 생성일시 */
  @CreateDateColumn()
  createdAt: Date;

  /** 수정일시 */
  @UpdateDateColumn()
  updatedAt: Date;

  /** 삭제일시 (소프트 삭제 시 설정) */
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}

// TODO: 이메일 인증 기능 추가
// TODO: 비밀번호 로그인 기능 추가 (bcrypt 해시 적용)
// TODO: 사용자 프로필 이미지 업로드 기능
// TODO: 사용자 권한 관리 (role 필드 추가)
// TODO: 계정 잠금 기능 (로그인 실패 횟수 제한)
