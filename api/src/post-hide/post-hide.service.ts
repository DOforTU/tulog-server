import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostService } from 'src/post/post.service';
import { PostHideRepository } from './post-hide.repository';
import { DataSource } from 'typeorm';
import { PostHide } from './post-hide.entity';
import { PostLikeService } from 'src/post-like/post-like.service';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class PostHideService {
  constructor(
    private readonly postService: PostService,
    private readonly postLikeService: PostLikeService,
    private readonly commentService: CommentService,
    private readonly postHideRepository: PostHideRepository,
    private readonly dataSource: DataSource,
  ) {}

  // ===== UPDATE =====

  /** Hide a post
   * 게시글이 있는지
   *
   */
  async hidePost(postId: number, userId: number): Promise<boolean> {
    // 게시글 숨길때 좋아요,댓글,게시글이 다같이 숨겨져야해서 트랜잭션으로
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) 게시글 존재 확인
      await this.postService.getPostById(postId);

      // 2) 이미 숨겨진 게시글인지 확인 (manager사용했는데 이게 쿼리 러너에 포함인가)
      const existing = await queryRunner.manager.findOne(PostHide, {
        where: { postId, userId },
      });
      if (existing) {
        await queryRunner.rollbackTransaction();
        return true;
      }

      // 3) 숨김 처리 저장
      await queryRunner.manager.save(PostHide, {
        postId,
        userId,
      });

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
}
