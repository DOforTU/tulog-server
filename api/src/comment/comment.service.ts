import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentWithAuthor, CreateCommentDto } from './comment.dto';
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
    parentCommentId?: number,
  ): Promise<Comment> {
    const post = await this.postService.getPostById(postId);

    // If parentCommentId is provided, validate that it's not already a reply
    if (parentCommentId) {
      const parentComment = await this.getCommentById(parentCommentId);

      // Check if the parent comment is already a reply (has a parentCommentId)
      if (parentComment.parentCommentId !== null) {
        throw new NotFoundException(
          'Cannot reply to a reply. Only one level of replies is allowed.',
        );
      }

      // Check if the parent comment belongs to the same post
      if (parentComment.postId !== postId) {
        throw new NotFoundException(
          'Parent comment does not belong to this post',
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // create comment
      const comment = queryRunner.manager.create(Comment, {
        ...createCommentDto,
        parentCommentId,
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

  async getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]> {
    const comments = await this.commentRepository.findByPostId(postId);
    if (!comments || comments.length === 0) {
      return [];
    }
    return comments.map((comment) => this.toCommentWithAuthor(comment));
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

  private toCommentWithAuthor(comment: Comment): CommentWithAuthor {
    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      createdAt: comment.createdAt,
      author: {
        id: comment.authorId,
        nickname: comment.author.nickname,
        profilePicture: comment.author.profilePicture,
        isActive: comment.author.isActive,
        role: comment.author.role,
      },
      replies: comment.replies?.map((reply) => this.toCommentWithAuthor(reply)),
    };
  }
}
