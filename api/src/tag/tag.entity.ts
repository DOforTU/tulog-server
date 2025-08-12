import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Common } from 'src/common/entity/common.entity';
import { PostTag } from 'src/post-tag/post-tag.entity';

@Entity('tag')
export class Tag extends Common {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => PostTag, (postTag) => postTag.tag)
  postTags: PostTag[];
}
