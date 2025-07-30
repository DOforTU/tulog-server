import { Common } from 'src/common/entity/common.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum AuthProvider {
  GOOGLE = 'google',
  LOCAL = 'local',
}

/**
 * Auth Entity
 */
@Entity('auth')
export class Auth extends Common {
  @PrimaryGeneratedColumn()
  id: number;

  /** Login provider */
  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  /** googleId, kakaoId, ... etc */
  @Column({ nullable: true })
  oauthId: string;

  @OneToOne(() => User, (user) => user.auth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
