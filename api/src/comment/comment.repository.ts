import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';
import { Comment } from './comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  // ===== CREATE =====

  async commentAtPost(
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      post: { id: postId },
      authorId: userId,
      content: createCommentDto.comment,
    });
    return await this.commentRepository.save(comment);
  }

  // =====  UPDATE FUNCTION =====

  async changeComment(
    postId: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment | null> {
    await this.commentRepository
      .createQueryBuilder()
      .update(Comment)
      .set({
        content: updateCommentDto.comment,
        updatedAt: new Date(), // Common 엔티티에서 상속받는 경우
      })
      .where('postId = :postId', { postId })
      .andWhere('authorId = :userId', { userId }) // ⚠️ 엔티티에서는 authorId였죠
      .execute();

    return this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.authorId = :userId', { userId })
      .getOne();
  }

  // ===== SUB FUNCTION =====

  async findOneById(commentId: number): Promise<Comment | null> {
    return this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id = :commentId', { commentId })
      .getOne();
  }
}
