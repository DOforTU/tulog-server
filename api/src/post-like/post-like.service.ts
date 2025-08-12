import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PostLike } from './post-like.entity';
import { User } from 'src/user/user.entity';
import { PostLikeRepository } from './post-like.repository';

@Injectable()
export class PostLikeService {
  constructor(private readonly postLikeRepository: PostLikeRepository) {}

  // ===== CREATE =====

  /** Like a post */
  async likePost(userId: number, postId: number): Promise<PostLike> {
    // Check if already liked
    const existingLike = await this.postLikeRepository.findLike(userId, postId);
    if (existingLike) {
      throw new ConflictException('Post already liked');
    }

    return await this.postLikeRepository.createLike(userId, postId);
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

  // ===== DELETE =====

  /** Unlike a post */
  async unlikePost(userId: number, postId: number): Promise<boolean> {
    const existingLike = await this.postLikeRepository.findLike(userId, postId);
    if (!existingLike) {
      throw new NotFoundException('Post not liked');
    }

    return await this.postLikeRepository.deleteLike(userId, postId);
  }
}
