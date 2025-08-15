import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { Comment } from 'src/comment/comment.entity';

@Entity('comment-like')
export class CommentLike {
  @PrimaryColumn()
  commentId: number;

  // name에 있는 컬럼을 이용해서 comment와 조인한다는 의미
  @ManyToOne(() => Comment)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @CreateDateColumn()
  createdAt: Date;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
