import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Post } from 'src/post/post.entity';
import { Tag } from 'src/tag/tag.entity';

@Entity('post_tag')
export class PostTag {
  @PrimaryColumn()
  postId: number;

  @PrimaryColumn()
  tagId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.postTags)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => Tag, (tag) => tag.postTags)
  @JoinColumn({ name: 'tagId' })
  tag: Tag;
}
