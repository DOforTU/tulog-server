import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Auth } from 'src/auth/auth.entity';
import { UserBlock } from 'src/block/user-block.entity';
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
  @MinLength(2)
  @MaxLength(30)
  @Matches(/^[^\s]+(?:\s[^\s]+)?$/, {
    message: 'Name must contain at most one space, and not at the start or end',
  })
  name: string;

  /** User nickname (default is email prefix) */
  @Column()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^[^\s]+$/, {
    message: 'Nickname must not contain spaces',
  })
  nickname: string;

  /** Password (used for LOCAL login) */
  @Column({ select: false, nullable: true })
  @MinLength(8)
  @MaxLength(20)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Must contain at least 1 uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Must contain at least 1 lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Must contain at least 1 number',
  })
  @Matches(/(?=.*[!@#$%^&*()\-_=+{}[\]|\\:;"'<>,.?/`~])/, {
    message: 'Must contain at least 1 special character',
  })
  @Matches(/^[^\s]+$/, {
    message: 'Password must not contain spaces',
  })
  @IsString()
  password: string;

  /** User role (default: regular user) */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  /** Profile picture URL */
  @Column()
  profilePicture: string;

  /** Account activation status */
  @Column({ default: false })
  isActive: boolean;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth: Auth;

  @OneToMany(() => Follow, (follow) => follow.follower)
  followings: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @OneToMany(() => UserBlock, (userBlcok) => userBlcok.blocked)
  blockers: UserBlock[];

  @OneToMany(() => UserBlock, (userBlcok) => userBlcok.blocker)
  blocked: UserBlock[];
}
