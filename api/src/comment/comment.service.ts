import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { PostService } from 'src/post/post.service';
import { CommentRepository } from './comment.repository';
import { Comment } from './comment.entity';
import { EntityManager } from 'typeorm';
import { PostHideService } from 'src/post-hide/post-hide.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postHideService: PostHideService,
    private readonly postService: PostService,
  ) {}

  // ===== CREATE =====

  async commentAtPost(
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postService.getPostById(postId);

    const isHidden = await this.postHideService.isHidden(postId);
    if (isHidden) {
      throw new ForbiddenException('You can not comment this post.');
    }

    // 3) 게시글 상태 확인 (예: PRIVATE이면 작성자만 가능)
    if (post.status === 'PRIVATE' && post.editors) {
      throw new ForbiddenException('You can not comment this post.');
    }

    return await this.commentRepository.commentAtPost(
      postId,
      userId,
      createCommentDto,
    );
  }

  // ===== UPDATE =====

  async changeComment(
    commentId: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment | null> {
    // 1) 기존 댓글 조회
    const existing = await this.commentRepository.findOneById(commentId);
    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    return await this.commentRepository.changeComment(
      commentId,
      userId,
      updateCommentDto,
    );
  }

  // ===== SUB FUNCTION =====

  async hideCommentsForPost(
    manager: EntityManager,
    postId: number,
    userId: number,
  ): Promise<boolean> {
    await manager.getRepository(Comment).save({ postId, authorId: userId });
    return true;
  }
}
