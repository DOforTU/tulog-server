import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostHide } from './post-hide.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class PostHideRepository {
  constructor(
    @InjectRepository(PostHide)
    private readonly postHideRepository: Repository<PostHide>,
  ) {}

  // ===== CREATE =====

  async hidePost(postId: number, userId: number): Promise<PostHide> {
    const post = await this.postHideRepository.create({ postId, userId });
    return await this.postHideRepository.save(post);
  }

  // ===== UPDATE =====
  /** Hide a post */
  async existingHiddenPost(
    postId: number,
    userId: number,
  ): Promise<PostHide | null> {
    const post = await this.postHideRepository.findOne({
      where: { postId, userId },
    });
    return post;
  }

  // ===== SUB FUNCTION =====

  async findHiddingPost(
    postId: number,
    userId: number,
  ): Promise<PostHide | null> {
    return this.postHideRepository
      .createQueryBuilder('post_hide')
      .where('post_hide.postId = :postId', { postId })
      .andWhere('post_hide.userId = :userId', { userId })
      .getOne();
  }

  // Check if it hide
  async isHidden(postId: number): Promise<boolean> {
    const post = await this.postHideRepository
      .createQueryBuilder('post_hide')
      .where('post_hide.postId = :postId', { postId })
      .getOne();

    return post !== null;
  }
}
