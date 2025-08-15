import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommentWithAuthor, CreateCommentDto } from './comment.dto';
import { PostService } from 'src/post/post.service';
import { CommentRepository } from './comment.repository';
import { Comment } from './comment.entity';
import { DataSource } from 'typeorm';
import { UserRole } from 'src/user/user.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postService: PostService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
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

  async getCommentByIdWithReplies(commentId: number): Promise<Comment> {
    const comment = await this.commentRepository.findByIdWithReplies(commentId);
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

  async softDeleteComment(
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

    // Get comment with replies to calculate total deletion count
    const commentWithReplies = await this.getCommentByIdWithReplies(commentId);
    const totalDeletedCount =
      this.calculateTotalCommentCount(commentWithReplies);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deletedAt = new Date();

      // Soft delete the parent comment
      await queryRunner.manager.update(Comment, comment.id, {
        deletedAt,
      });

      // Soft delete all replies if they exist
      if (commentWithReplies.replies && commentWithReplies.replies.length > 0) {
        const replyIds = commentWithReplies.replies.map((reply) => reply.id);
        await queryRunner.manager.update(Comment, replyIds, {
          deletedAt,
        });
      }

      // Decrease comment count by the total number of deleted comments (parent + replies)
      post.commentCount -= totalDeletedCount;
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

  private calculateTotalCommentCount(comment: Comment): number {
    // Count the comment itself + all its replies
    return 1 + (comment.replies?.length || 0);
  }

  private toCommentWithAuthor(comment: Comment): CommentWithAuthor {
    const defaultAvatarUrl = this.configService.get('USER_DEFAULT_AVATAR_URL');

    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      createdAt: comment.createdAt,
      author: comment.author
        ? {
            id: comment.author.id,
            nickname: comment.author.nickname,
            profilePicture: comment.author.profilePicture,
            isActive: comment.author.isActive,
            role: comment.author.role,
          }
        : {
            id: 0,
            nickname: 'Deleted User',
            profilePicture: defaultAvatarUrl,
            isActive: false,
            role: UserRole.USER,
          },
      replies: comment.replies?.map((reply) => this.toCommentWithAuthor(reply)),
    };
  }
}
