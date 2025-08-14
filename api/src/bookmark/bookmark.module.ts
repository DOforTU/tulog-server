import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './bookmark.entity';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { User } from 'src/user/user.entity';
import { BookmarkRepository } from './bookmark.repository';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, User]), PostModule],
  providers: [BookmarkService, BookmarkRepository],
  controllers: [BookmarkController],
  exports: [BookmarkService, BookmarkRepository],
})
export class BookmarkModule {}
