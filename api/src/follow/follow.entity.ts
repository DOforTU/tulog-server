import { User } from 'src/user/user.entity';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * Follow Entity
 */
@Entity('follow')
export class Follow {
  @PrimaryColumn()
  followerId: number;

  @PrimaryColumn()
  followingId: number;

  /** Creation timestamp */
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @ManyToOne(() => User, (user) => user.followings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User;
}
