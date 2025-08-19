import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './tag.entity';
import { PostTag } from 'src/post-tag/post-tag.entity';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TagRepository } from './tag.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, PostTag])],
  providers: [TagService, TagRepository],
  controllers: [TagController],
  exports: [TypeOrmModule, TagService],
})
export class TagModule {}
