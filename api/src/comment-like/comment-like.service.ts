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
   * 댓글 좋아요 취소
   * 댓글이 존재하는지 확인
   * 내가 좋아요한 댓글인지
   * 댓글 좋아요 취소만 하는거라 연쇄 작업 없음
   */
  async deleteLike(userId: number, commentId: number) {
    await this.commentService.getCommentById(commentId);
    const likedComment = await this.commentLikeRepository.findLikedComment(
      userId,
      commentId,
    );
    if (!likedComment) {
      throw new NotFoundException('Can not found.');
    }

    return await this.commentLikeRepository.deleteLike(userId, commentId);
  }

  // ===== SUB FUNCTION =====
}
