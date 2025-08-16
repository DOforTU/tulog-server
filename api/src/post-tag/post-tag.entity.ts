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

// 태그 엔터티를 통해서 관련 게시글 참조하기 위함
// 이는 post와 tag의 중간테이블???????와우
