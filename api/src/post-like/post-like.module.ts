import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from './post-like.entity';
import { PostLikeController } from './post-like.controller';
import { PostLikeService } from './post-like.service';
import { PostLikeRepository } from './post-like.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike])],
  providers: [PostLikeService, PostLikeRepository],
  controllers: [PostLikeController],
  exports: [PostLikeService, PostLikeRepository],
})
export class PostLikeModule {}
