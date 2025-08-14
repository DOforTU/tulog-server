import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookmarkRepository } from './bookmark.repository';

@Injectable()
export class BookmarkService {
  constructor(private readonly bookmarkRepository: BookmarkRepository) {}

  // ===== CREATE =====

  /** Bookmark a post */
  async bookmarkPost(userId: number, postId: number) {
    // Check if already bookmark
    const bookmarkingPost = await this.bookmarkRepository.findBookmark(
      userId,
      postId,
    );
    if (bookmarkingPost) {
      throw new ConflictException('Post is already bookmarked');
    }
    return await this.bookmarkRepository.bookmarkPost(userId, postId);
  }

  // ===== DELETE =====

  /** Delete a bookmark */
  async deleteBookMark(userId: number, postId: number) {
    // Check if already bookmark
    const bookmarkingPost = await this.bookmarkRepository.findBookmark(
      userId,
      postId,
    );
    if (!bookmarkingPost) {
      throw new NotFoundException('Post is not bookmarked');
    }
    return await this.bookmarkRepository.deleteBookMark(userId, postId);
  }
}
