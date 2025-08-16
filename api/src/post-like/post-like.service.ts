import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PostLike } from './post-like.entity';
import { User } from 'src/user/user.entity';
import { PostLikeRepository } from './post-like.repository';
import { DataSource, EntityManager } from 'typeorm';
import { Post } from 'src/post/post.entity';
import { PostCardDto } from 'src/post/post.dto';
import { PostService } from 'src/post/post.service';

@Injectable()
export class PostLikeService {
  constructor(
    private readonly postLikeRepository: PostLikeRepository,
    private readonly postService: PostService,
    private readonly dataSource: DataSource,
  ) {}

  // ===== CREATE =====

  /** Like a post */
  async likePost(userId: number, postId: number): Promise<PostLike> {
    // Check if already liked
    const existingLike = await this.postLikeRepository.findLike(userId, postId);
    if (existingLike) {
      throw new ConflictException('Post already liked');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const postLike = await this.postLikeRepository.createLike(userId, postId);
      // queryRunner를 활용하여 post의 likeCount 증가
      await queryRunner.manager
        .getRepository(Post)
        .increment({ id: postId }, 'likeCount', 1);

      await queryRunner.commitTransaction();
      return postLike;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== READ =====

  /** Get like count for a post */
  async getLikeCount(postId: number): Promise<number> {
    return await this.postLikeRepository.getLikeCount(postId);
  }

  /** Check if user liked a post */
  async isLiked(userId: number, postId: number): Promise<boolean> {
    const like = await this.postLikeRepository.findLike(userId, postId);
    return like !== null;
  }

  /** Get users who liked a post */
  async getLikes(postId: number): Promise<User[]> {
    return await this.postLikeRepository.getLikes(postId);
  }

  /** Get posts user liked */
  async getLikedPostsByUser(userId: number): Promise<PostCardDto[]> {
    const post = await this.findLikedPostsByUser(userId);
    if (!post) {
      return [];
    }
    return post.map((post) => this.postService.transformToPublicPostDto(post));
  }

  private async findLikedPostsByUser(userId: number): Promise<Post[]> {
    return this.postLikeRepository.findLikedPostsByUser(userId);
  }

  // ===== DELETE =====

  /** Unlike a post */
  async unlikePost(userId: number, postId: number): Promise<boolean> {
    // 게시글 자체가 존재하는지는 몰라도 되는건가? 애초에 좋아요 취소여서 없으면 없는건가 뭐 그런거같네
    const existingLike = await this.postLikeRepository.findLike(userId, postId);
    if (!existingLike) {
      throw new NotFoundException('Post not liked');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .getRepository(Post)
        .decrement({ id: postId }, 'likeCount', 1); // 좋아요 취소시 좋아요 개수 감소

      await this.postLikeRepository.deleteLike(userId, postId);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ===== SUB FUNCTION =====
  async hideLikesForPost(
    manager: EntityManager,
    postId: number,
    userId: number,
  ): Promise<boolean> {
    return await this.postLikeRepository.hideLikesForPost(
      manager,
      postId,
      userId,
    );
  }
}
