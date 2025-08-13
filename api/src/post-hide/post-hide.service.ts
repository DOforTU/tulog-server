import { Injectable, NotFoundException } from '@nestjs/common';
import { PostService } from 'src/post/post.service';
import { PostHideRepository } from './post-hide.repository';

@Injectable()
export class PostHideService {
  constructor(
    private readonly postService: PostService,
    private readonly postHideRepository: PostHideRepository,
  ) {}

  // ===== UPDATE =====

  /** Hide a post
   * 게시글이 있는지
   *
   */
  async hidePost(postId: number, userId: number): Promise<boolean> {
    await this.postService.getPostById(postId);
    const existing = await this.postHideRepository.findExistingPost(
      postId,
      userId,
    );
    if (existing) {
      // 이미 숨김 처리된 상태면 그대로 true 반환
      return true;
    }
    return await this.postHideRepository.hidePost(postId, userId);
  }
}
