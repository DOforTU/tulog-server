import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookmarkRepository } from './bookmark.repository';
import { PostCardDto } from 'src/post/post.dto';
import { PostService } from 'src/post/post.service';
import { Post } from 'src/post/post.entity';

@Injectable()
export class BookmarkService {
  constructor(
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly postService: PostService,
  ) {}

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

  // ===== READ =====
  /**
   *
   * @param userId 유저가 북마크한 포스트를 찾아야지
   * @returns 없다면 찾을수없다고 예외처리
   * 있다면 그 포스트를 postService에 있는 postcardDto형태로 변환해줘야해
   * findbookmarkedpostsbyuser 유저 아이디로 마크된 포스트를 찾는 함수를 따로 빼줬어
   * 이때 게시글 반환은 변환이 없이 원본 그대로 찾아오는거야
   */
  async getMarkedPost(userId: number): Promise<PostCardDto[] | null> {
    const post = await this.findBookmarkedPostsByUser(userId);
    if (!post) {
      throw new NotFoundException('Can not found.');
    }
    return post.map((post) => this.postService.transformToPublicPostDto(post));
  }

  private async findBookmarkedPostsByUser(
    userId: number,
  ): Promise<Post[] | null> {
    return this.bookmarkRepository.findBookmarkedPostsByUser(userId);
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
