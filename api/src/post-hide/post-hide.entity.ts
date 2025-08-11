import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Common } from 'src/common/entity/common.entity';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';

@Entity('post_hide')
export class PostHide extends Common {
  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
