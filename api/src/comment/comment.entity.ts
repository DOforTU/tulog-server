import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Common } from 'src/common/entity/common.entity';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import { CommentLike } from 'src/comment-like/comment-like.entity';

@Entity('comment')
export class Comment extends Common {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column()
  postId: number;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ nullable: true })
  authorId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ nullable: true })
  parentCommentId: number;

  // 댓글은 자기를 참조하기에 자신과 조인
  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment: Comment;

  // 부모 댓글로 부터 답글
  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment)
  likes: CommentLike[];

  // 댓글은 자기참조 댓글 - 댓글은 many to many (가 아니라)
  // 자기 참조니까 부모 댓글로 부터 댓글을 작성하는 방식
}
