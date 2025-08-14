import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from './post-like.entity';
import { PostLikeController } from './post-like.controller';
import { PostLikeService } from './post-like.service';
import { PostLikeRepository } from './post-like.repository';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike]), PostModule],
  providers: [PostLikeService, PostLikeRepository],
  controllers: [PostLikeController],
  exports: [PostLikeService, PostLikeRepository],
})
export class PostLikeModule {}
