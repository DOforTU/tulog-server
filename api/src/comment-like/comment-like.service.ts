import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentLike } from './comment-like.entity';
import { CommentLikeRepository } from './comment-like.repository';
import { CommentLikeCardDto } from './comment-like.dto';
import { PostService } from 'src/post/post.service';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class CommentLikeService {
  constructor(
    private readonly commentLikeRepository: CommentLikeRepository,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  // ===== CREATE =====
  /**
   *
   * @param userId 사용자가 댓글에 좋아요 누름
   * @param commentId 댓글이 존재하는지
   * @returns 게시글이 존재하는지
   */
  async likeComment(userId: number, commentId: number): Promise<CommentLike> {
    await this.commentService.getCommentById(commentId);

    return await this.commentLikeRepository.likeComment(userId, commentId);
  }

  // ===== READ =====
  /**
   * 내가 누른 모든 댓글 조회
   */
  //  async getLikedComments(userId: number): Promise<CommentLike[]> {
  //    const comment =
  //      await this.commentLikeRepository.findLikedCommentsByUserId(userId);
  //    if (!comment) {
  //      throw new NotFoundException('Can not found.');
  //    }
  //    return await this.commentLikeRepository.findLikedCommentsByUserId(userId);
  //  }

  // ===== DELETE =====
  /**
   * 그냥 댓글 좋아요 취소
   */
  async deleteLike(userId: number, commentId: number) {
    return await this.commentLikeRepository.deleteLike(userId, commentId);
  }

  // ===== SUB FUNCTION =====
}
