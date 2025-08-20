import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTag } from 'src/post-tag/post-tag.entity';
import { Tag } from 'src/tag/tag.entity';
import { PostModule } from 'src/post/post.module';
import { Search } from './search.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Search, Tag, PostTag]),
    PostModule,
    UserModule,
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
