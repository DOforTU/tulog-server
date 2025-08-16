import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';

export enum EditorRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

@Entity('editor')
export class Editor {
  @PrimaryColumn()
  postId: number;
  // 위 아래 게시글과 조인
  @ManyToOne(() => Post, (post) => post.editors)
  @JoinColumn({ name: 'postId' })
  post: Post;

  // 유저아이디로 유저와 조인
  @PrimaryColumn()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.editors)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: EditorRole,
    default: EditorRole.EDITOR,
  })
  role: EditorRole;
}
