import { ConflictException, Injectable } from '@nestjs/common';
import { PostService } from 'src/post/post.service';
import { PostHideRepository } from './post-hide.repository';
import { DataSource } from 'typeorm';
import { PostHide } from './post-hide.entity';

@Injectable()
export class PostHideService {
  constructor(
    private readonly postHideRepository: PostHideRepository,
    private readonly postService: PostService,
    private readonly dataSource: DataSource,
  ) {}

  // ===== CREATE =====
  /**
   * 게시글 주인인지
   * 이미 숨김처리인지
   */
  async hidePost(postId: number, userId: number): Promise<PostHide> {
    await this.postService.getPostById(postId);

    // Check if already hide

    const hiddenPost = await this.isHidden(userId, postId);
    if (hiddenPost) {
      throw new ConflictException('You already hided this post.');
    }

    return await this.postHideRepository.hidePost(postId, userId);
  }

  // ===== UPDATE =====

  /** Hide a post
   * 게시글이 있는지
   */
  async deleteHide(postId: number, userId: number): Promise<boolean> {
    await this.postService.getPostById(postId);

    const hiddenPost = await this.isHidden(userId, postId);
    if (hiddenPost) {
      throw new ConflictException('You already hided this post.');
    }

    return await this.postHideRepository.deleteHide(postId, userId);
  }

  // ===== SUB FUNCTION =====

  async isHidden(userId: number, postId: number): Promise<boolean> {
    return await this.postHideRepository.isHidden(userId, postId);
  }
}
