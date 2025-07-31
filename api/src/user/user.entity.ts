import { Auth } from 'src/auth/auth.entity';
import { Common } from 'src/common/entity/common.entity';
import { Follow } from 'src/follow/follow.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToOne,
  OneToMany,
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
@Index('UQ_user_email_not_deleted', ['email'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Index('UQ_user_nickname_not_deleted', ['nickname'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
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

  @OneToMany(() => Follow, (follow) => follow.following)
  followings: Follow[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  followers: Follow[];
}

// TODO: Add email verification functionality
// TODO: Add password login functionality (with bcrypt hash)
// TODO: Add user profile image upload functionality
// TODO: Add user permission management (role field)
// TODO: Add account locking functionality (login failure count limit)
