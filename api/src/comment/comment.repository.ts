import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostHide } from './post-hide.entity';
import { Post } from 'src/post/post.entity';
import { CreateCommentDto } from './comment.dto';

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
      post: { id: postId }, // 올바른 필드
      authorId: userId, // 오타 수정: autorId → authorId
      content: createCommentDto.comment, // DTO 필드명 확인 필요
    });
    return await this.commentRepository.save(comment);
  }

  // =====  UPDATE FUNCTION =====

  async changeComment(
    postId: number,
    userId: number,
  ): Promise<PostHide | null> {
    return this.commentRepository
      .createQueryBuilder('post_hide')
      .where('hide.postId = :postId', { postId })
      .andWhere('hide.userId = :userId', { userId })
      .getOne();
  }
}
