import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './comment.dto';
import { PostService } from 'src/post/post.service';
import { CommentRepository } from './comment.repository';
import { Comment } from './comment.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService,
    private readonly dataSource: DataSource,
  ) {}

  // ===== CREATE =====

  async createComment(
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postService.getPostById(postId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // create comment
      const comment = queryRunner.manager.create(Comment, {
        ...createCommentDto,
        postId,
        authorId: userId,
      });

      // increase post's comment count
      post.commentCount++;
      await queryRunner.manager.save(post);
      await queryRunner.manager.save(comment);

      await queryRunner.commitTransaction();
      return comment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== READ =====

  async getCommentById(commentId: number): Promise<Comment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  // ===== DELETE =====

  async deleteComment(
    commentId: number,
    postId: number,
    userId: number,
  ): Promise<void> {
    // check if comment belongs to post
    const comment = await this.getCommentById(commentId);
    const post = await this.postService.getPostById(postId);

    if (comment.postId !== post.id) {
      throw new NotFoundException('Comment not found in this post');
    }

    // is comment mine?
    // TODO: isMyComment has getCommentById. It's duplication problem
    if (!(await this.isMyComment(commentId, userId))) {
      throw new NotFoundException('Comment not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(comment);
      post.commentCount--;
      await queryRunner.manager.save(post);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== SUB FUNCTIONS =====
  async isMyComment(commentId: number, userId: number): Promise<boolean> {
    const comment = await this.getCommentById(commentId);
    return comment.authorId === userId;
  }
}
