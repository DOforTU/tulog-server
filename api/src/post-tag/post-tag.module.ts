import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTag } from './post-tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostTag])],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class PostTagModule {}