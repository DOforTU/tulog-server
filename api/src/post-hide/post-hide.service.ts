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
    // Check if already hide
    const bookmarkingPost = await this.isHidden(postId);
    if (bookmarkingPost) {
      throw new ConflictException('Post is already hidden');
    }
    await this.postService.getPostById(postId);

    const isOwner = await this.postService.isOwner(postId, userId);
    if (!isOwner) {
      throw new ForbiddenException('게시글 작성자만 숨김 처리할 수 있습니다.');
    }

    return await this.postHideRepository.hidePost(postId, userId);
  }

  // ===== UPDATE =====

  /** Hide a post
   * 게시글이 있는지
   */
  async deleteHide(postId: number, userId: number): Promise<boolean> {
    // 2) 이미 숨겨진 게시글인지 확인 (manager사용했는데 이게 쿼리 러너에 포함인가)
    const existing = await this.postHideRepository.existingHiddenPost(
      postId,
      userId,
    );

    if (!existing) {
      throw new ConflictException('There is no hidden post.');
    }

    // 1) 게시글 존재 확인
    await this.postService.getPostById(postId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3) 숨김 처리 저장
      const result = await queryRunner.manager.delete(PostHide, {
        postId,
        userId,
      });
      if (result.affected === 0) {
        throw new InternalServerErrorException('Failed to unhide the post.');
      }

      // 6) 커밋
      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed hiding a post.');
    } finally {
      await queryRunner.release();
    }
  }

  // ===== SUB FUNCTION =====

  async isHidden(postId: number): Promise<boolean> {
    return await this.postHideRepository.isHidden(postId);
  }
}
