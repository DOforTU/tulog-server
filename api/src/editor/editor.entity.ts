import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Common } from 'src/common/entity/common.entity';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';

export enum EditorRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

@Entity('editor')
export class Editor extends Common {
  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, (post) => post.editors)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @PrimaryColumn()
  userId: number;

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
