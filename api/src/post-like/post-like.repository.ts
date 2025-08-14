import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PostLike } from './post-like.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
  ) {}

  // ===== CREATE =====

  /** Create a like */
  async createLike(userId: number, postId: number): Promise<PostLike> {
    const like = this.postLikeRepository.create({
      userId,
      postId,
    });
    return await this.postLikeRepository.save(like);
  }

  // ===== READ =====

  /** Find a specific like */
  async findLike(userId: number, postId: number): Promise<PostLike | null> {
    return await this.postLikeRepository
      .createQueryBuilder('postLike')
      .where('postLike.userId = :userId', { userId })
      .andWhere('postLike.postId = :postId', { postId })
      .getOne();
  }

  /** Get like count for a post */
  async getLikeCount(postId: number): Promise<number> {
    return await this.postLikeRepository
      .createQueryBuilder('postLike')
      .where('postLike.postId = :postId', { postId })
      .getCount();
  }

  /** Get users who liked a post */
  async getLikes(postId: number): Promise<User[]> {
    const likes = await this.postLikeRepository
      .createQueryBuilder('postLike')
      .innerJoinAndSelect('postLike.user', 'user')
      .where('postLike.postId = :postId', { postId })
      .getMany();

    return likes.map((like) => like.user);
  }

  // ===== DELETE =====

  /** Delete a like */
  async deleteLike(userId: number, postId: number): Promise<boolean> {
    const result = await this.postLikeRepository
      .createQueryBuilder()
      .delete()
      .from(PostLike)
      .where('userId = :userId', { userId })
      .andWhere('postId = :postId', { postId })
      .execute();

    return result.affected ? result.affected > 0 : false;
  }

  // ===== SUB FUNCTION =====
  async hideLikesForPost(
    manager: EntityManager,
    postId: number,
    userId: number,
  ): Promise<boolean> {
    await manager.getRepository(PostLike).save({ postId, userId });
    return true;
  }
}
