import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { PostModule } from 'src/post/post.module';
import { PostHideModule } from 'src/post-hide/post-hide.module';
import { CommentLike } from './comment-like.entity';
import { CommentModule } from 'src/comment/comment.module';
import { CommentLikeService } from './comment-like.service';
import { CommentLikeRepository } from './comment-like.repository';
import { CommentLikeController } from './comment-like.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentLike, User]),
    PostModule,
    CommentModule,
  ],
  providers: [CommentLikeService, CommentLikeRepository],
  controllers: [CommentLikeController],
  exports: [CommentLikeService, CommentLikeRepository],
})
export class CommentLikeModule {}
