import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostHide } from './post-hide.entity';
import { Post } from 'src/post/post.entity';

@Injectable()
export class PostHideRepository {
  constructor(
    @InjectRepository(PostHide)
    private readonly postHideRepository: Repository<PostHide>,
  ) {}

  // ===== UPDATE =====
  /** Hide a post */
  async hidePost(postId: number, userId: number): Promise<boolean> {
    await this.postHideRepository.save({
      postId,
      userId,
      hiddenAt: new Date(),
    });
    return true;
  }

  // ===== SUB FUNCTION =====

  async findExistingPost(
    postId: number,
    userId: number,
  ): Promise<PostHide | null> {
    return this.postHideRepository
      .createQueryBuilder('post_hide')
      .where('post_hide.postId = :postId', { postId })
      .andWhere('post_hide.userId = :userId', { userId })
      .getOne();
  }
}
