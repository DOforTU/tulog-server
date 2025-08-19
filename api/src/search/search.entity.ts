import { Post } from 'src/post/post.entity';
import { Tag } from 'src/tag/tag.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('search')
export class Search {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  Keyword: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: Post; // 이 검색이 연결된 게시글 (검색어를 통해 게시글을 확인)

  @ManyToOne(() => Tag, { nullable: true })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag; // 이 검색이 연결된 태그 (검색을 통해 태그 즉, 검색이 태그일수도)

  @CreateDateColumn()
  createdAt: Date; // 언제 검색했는지 기록
}
