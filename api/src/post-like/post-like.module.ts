import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from './post-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike])],
  providers: [],
  controllers: [],
  exports: [],
})
export class PostLikeModule {}
