import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostService } from 'src/post/post.service';
import { PostHideRepository } from './post-hide.repository';
import { DataSource } from 'typeorm';
import { PostHide } from './post-hide.entity';
import { PostLikeService } from 'src/post-like/post-like.service';
import { CommentService } from 'src/comment/comment.service';
import { User } from 'src/user/user.entity';

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
    // 2) 이미 숨겨진 게시글인지 확인 (manager사용했는데 이게 쿼리 러너에 포함인가)
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
