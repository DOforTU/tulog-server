import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Common } from 'src/common/entity/common.entity';
import { Team } from 'src/team/team.entity';
import { Editor } from 'src/editor/editor.entity';

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

@Entity('post')
export class Post extends Common {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  /** summary */
  @Column('text', { nullable: true })
  excerpt: string;

  @Column()
  thumbnailImage: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  teamId: number;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @OneToMany(() => Editor, (editor) => editor.post)
  editors: Editor[];
}
