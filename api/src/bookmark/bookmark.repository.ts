import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from './bookmark.entity';
import { Repository } from 'typeorm';
import { Post } from 'src/post/post.entity';

@Injectable()
export class BookmarkRepository {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) {}

  // ===== CREATE =====

  /** bookmark a post */
  async bookmarkPost(userId: number, postId: number): Promise<Bookmark> {
    const bookmark = this.bookmarkRepository.create({
      userId,
      postId,
    });
    return await this.bookmarkRepository.save(bookmark);
  }

  // ===== READ =====

  async getMarkedPost() {}

  // ===== DELETE =====

  /** Delete a bookmark */
  async deleteBookMark(userId: number, postId: number): Promise<boolean> {
    const result = await this.bookmarkRepository
      .createQueryBuilder()
      .delete()
      .from(Bookmark)
      .where('userId = :userId', { userId })
      .andWhere('postId = :postId', { postId })
      .execute();

    return result.affected ? result.affected > 0 : false;
  }

  // ===== SUB FUNCTION =====

  /** find already bookmarked post */
  async findBookmark(userId: number, postId: number): Promise<Bookmark | null> {
    return await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.postId = :postId', { postId })
      .getOne();
  }

  async findBookmarkedPostsByUser(userId: number): Promise<Post[] | null> {
    const bookmarks = await this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.post', 'post')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('bookmark.user.id = :userId', { userId })
      .getMany();
    return bookmarks.map((b) => b.post);
  }
}
