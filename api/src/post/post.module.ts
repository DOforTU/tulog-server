import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Editor } from 'src/editor/editor.entity';
import { Tag } from 'src/tag/tag.entity';
import { PostTag } from 'src/post-tag/post-tag.entity';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { PostController } from './post.controller';
import { TeamMemberModule } from 'src/team-member/team-member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Editor, Tag, PostTag]),
    TeamMemberModule,
  ],
  providers: [PostService, PostRepository],
  controllers: [PostController],
  exports: [PostService, PostRepository],
})
export class PostModule {}
