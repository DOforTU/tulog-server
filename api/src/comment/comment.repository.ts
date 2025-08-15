import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  // ===== READ =====

  async findById(commentId: number): Promise<Comment | null> {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id = :id', { id: commentId })
      .getOne();
  }
}
