import { Auth } from 'src/auth/auth.entity';
import { Common } from 'src/common/entity/common.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToOne,
} from 'typeorm';

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
export class User extends Common {
  @PrimaryGeneratedColumn()
  id: number;

  /** User email (used for Google OAuth login) */
  @Column()
  email: string;

  /** User real name (firstName + lastName from Google login) */
  @Column()
  name: string;

  /** User nickname (default is email prefix) */
  @Column()
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

  /** Profile picture URL */
  @Column({ default: 'default-avatar.png' })
  profilePicture: string;

  /** Account activation status */
  @Column({ default: false })
  isActive: boolean;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth: Auth;
}

// TODO: Add email verification functionality
// TODO: Add password login functionality (with bcrypt hash)
// TODO: Add user profile image upload functionality
// TODO: Add user permission management (role field)
// TODO: Add account locking functionality (login failure count limit)
