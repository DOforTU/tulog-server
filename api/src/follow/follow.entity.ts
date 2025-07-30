import { User } from 'src/user/user.entity';
import {
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  ManyToOne,
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

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
    follower: User;

  @ManyToOne(() => User, (user) => user.followings, { onDelete: 'CASCADE' })
    following: User;

}

