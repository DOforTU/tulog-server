import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PostLike } from './post-like.entity';
import { User } from 'src/user/user.entity';
import { PostCardDto } from 'src/post/post.dto';
import { Post } from 'src/post/post.entity';

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

  /** Get posts user liked */
  async findLikedPostsByUser(userId: number): Promise<Post[]> {
    const likedPost = await this.postLikeRepository
      .createQueryBuilder('post_like')
      .leftJoinAndSelect('post_like.user', 'likeUser') // 편집자랑 이름이 같아서 구분하기 위해 좋아요 누른 유저
      .leftJoinAndSelect('post_like.post', 'post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'editorUser') // 편집자 유저
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('likeUser.id = :userId', { userId }) // 여기서 likeUser를 사용
      .getMany();
    return likedPost.map((l) => l.post);
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

    return result.affected ? result.affected > 0 : false; //이 로직은 return (result.affected || 0) > 0; 랑 같은 말인건가
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
