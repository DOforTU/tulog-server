import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { User } from 'src/user/user.entity';
import { PostModule } from 'src/post/post.module';
import { PostHideModule } from 'src/post-hide/post-hide.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User]),
    PostModule,
    PostHideModule,
  ],
  providers: [CommentService, CommentRepository],
  controllers: [CommentController],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
