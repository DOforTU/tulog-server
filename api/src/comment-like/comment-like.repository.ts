import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from './comment-like.entity';
import { Repository } from 'typeorm';
import { CommentLikeCardDto } from './comment-like.dto';

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
  ) {}

  // ===== CREATE =====

  /** Create a like */
  async likeComment(userId: number, commentId: number): Promise<CommentLike> {
    const like = this.commentLikeRepository.create({
      userId,
      commentId,
    });
    return await this.commentLikeRepository.save(like);
  }

  // ===== READ =====

  /** Get comment user liked
   * 내가 좋아요 누른 댓글 모두 조회
   * 유저랑 조인하고, 댓글이랑 조인하고
   */
  //  async findLikedCommentsByUserId(userId: number): Promise<CommentLike[]> {
  //    const likeComment = await this.commentLikeRepository
  //      .createQueryBuilder('commentLike')
  //      .leftJoinAndSelect('commentLike.user', 'likeUser')
  //      .leftJoinAndSelect('commentLike.comment', 'comment')
  //      .leftJoinAndSelect('comment.author', 'author')
  //      .leftJoinAndSelect('comment.likes', 'likes')
  //      .where('likeUser.id = :userId', { userId }) // 여기서 likeUser를 사용
  //      .getMany();
  //    return likeComment;
  //  }

  // ===== DELETE =====

  /** Delete a like */
  async deleteLike(userId: number, commentId: number): Promise<void> {
    const result = await this.commentLikeRepository
      .createQueryBuilder()
      .delete()
      .from('commentLike')
      .where('userId = :userId', { userId })
      .andWhere('commentId = :commentId', { commentId })
      .execute();
  }

  async findLikedComment(
    userId: number,
    commentId: number,
  ): Promise<CommentLike | null> {
    return await this.commentLikeRepository
      .createQueryBuilder('commentLike')
      .where('commentLike.userId = :userId', { userId })
      .andWhere('commentLike.commentId = :commentId', { commentId })
      .getOne();
  }
}
