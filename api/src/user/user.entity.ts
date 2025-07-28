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
 * User Entity
 * - Google OAuth login support
 * - Soft Delete functionality included
 * - Unique constraints for email/nickname applied only to non-deleted users
 */
@Entity('user')
@Index(['email'], { where: '"isDeleted" = false', unique: true })
@Index(['nickname'], { where: '"isDeleted" = false', unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /** User email (used for Google OAuth login) */
  @Column()
  email: string;

  /** User real name (firstName + lastName from Google login) */
  @Column({ nullable: true })
  username: string;

  /** User nickname (default is email prefix) */
  @Column({ nullable: true })
  nickname: string;

  /** Password (used for LOCAL login) */
  @Column({ select: false, nullable: true })
  password: string;

  /** User role (default: regular user) */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  /** Google OAuth ID */
  @Column({ nullable: true })
  googleId: string;

  /** Profile picture URL */
  @Column({ default: 'default-avatar.png' })
  profilePicture: string;

  /** Login provider */
  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.GOOGLE,
  })
  provider: AuthProvider;

  /** Account activation status */
  @Column({ default: true })
  isActive: boolean;

  /** Soft delete flag */
  @Column({ default: false })
  isDeleted: boolean;

  /** Creation timestamp */
  @CreateDateColumn()
  createdAt: Date;

  /** Update timestamp */
  @UpdateDateColumn()
  updatedAt: Date;

  /** Deletion timestamp (set when soft deleted) */
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}

// TODO: Add email verification functionality
// TODO: Add password login functionality (with bcrypt hash)
// TODO: Add user profile image upload functionality
// TODO: Add user permission management (role field)
// TODO: Add account locking functionality (login failure count limit)
