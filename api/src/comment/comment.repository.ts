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

  async findByPostId(postId: number): Promise<Comment[]> {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.author', 'replyAuthor')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentCommentId IS NULL')
      .getMany();
    
    
  async findById(commentId: number): Promise<Comment | null> {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id = :id', { id: commentId })
      .getOne();
  }

  async findByIdWithReplies(commentId: number): Promise<Comment | null> {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.replies', 'replies')
      .where('comment.id = :id', { id: commentId })
      .getOne();
  }

  async findByPostId(postId: number): Promise<Comment[]> {
    return await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.author', 'replyAuthor')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentCommentId IS NULL')
      .getMany();
  }
}
