import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchRepository } from './search.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTag } from 'src/post-tag/post-tag.entity';
import { Tag } from 'src/tag/tag.entity';
import { PostModule } from 'src/post/post.module';
import { Search } from './search.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Search, Tag, PostTag]), PostModule],
  providers: [SearchService, SearchRepository],
  controllers: [SearchController],
  exports: [SearchService, SearchRepository],
})
export class SearchModule {}
