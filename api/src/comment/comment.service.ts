import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CommentWithAuthor,
  CreateCommentDto,
  UpdateCommentDto,
} from './comment.dto';
import { PostService } from 'src/post/post.service';
import { CommentRepository } from './comment.repository';
import { Comment } from './comment.entity';
import { DataSource, EntityManager } from 'typeorm';
import { PostHideService } from 'src/post-hide/post-hide.service';
import { ConfigService } from '@nestjs/config';
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
    parentCommentId?: number, // 부모 댓글은 어디서 가져오는거지?
  ): Promise<Comment> {
    const post = await this.postService.getPostById(postId);

    if (parentCommentId) {
      const parentComment = await this.getCommentById(parentCommentId);
      // Check if the parent comment is already a reply (has a parentCommentId)
      if (parentComment.parentCommentId !== null) {
        throw new NotFoundException(
          'Cannot reply to a reply. Only one level of replies is allowed.',
        );
      }

      if (parentComment.postId !== postId) {
        throw new NotFoundException(
          'Parent comment does not belong to this post.',
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = queryRunner.manager.create(Comment, {
        ...createCommentDto,
        parentCommentId,
        postId,
        authorId: userId,
      });

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
    const comment = await this.commentRepository.findOneById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
    return comment;
  }

  // 포스트로 댓글을 조회하는데 댓글이 없으면 포스트는 보여져야하기 때문에 빈배열 반환
  // commentwithauthor은 게시글에 댓글작성한 사용자를 보여지기 위함
  // 그 사용자는public user로 보임
  async getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]> {
    const comment = await this.commentRepository.findByPostId(postId);
    if (!comment || comment.length === 0) {
      return [];
    }
    return comment;
  }

  async getCommentByIdWithReplies(commetnId: number): Promise<Comment> {
    const comment = await this.commentRepository.findByIdWithReplies(commetnId);
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
    return comment as Comment;
  }

  // ===== DELETE =====

  async deleteComment(
    commentId: number,
    postId: number,
    userId: number,
  ): Promise<void> {
    // 1) 기존 댓글 및 게시글 조회
    const comment = await this.getCommentById(commentId);
    const post = await this.postService.getPostById(postId);

    // 게시글이랑 댓글단 게시글 아이디를 비교
    if (comment.postId !== post.id) {
      throw new NotFoundException('Comment not found in this post.');
    }

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
      if (commentWithReplies.replies && commentWithReplies.replies.length > 0) {
        const replyId = commentWithReplies.replies.map((reply) => reply.id);
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

  // ===== SUB FUNCTION =====

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
