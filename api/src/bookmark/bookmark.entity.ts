import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';

@Entity('bookmark')
export class Bookmark {
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

  @CreateDateColumn()
  createdAt: Date;
}
