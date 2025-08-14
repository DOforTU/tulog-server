import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from 'src/post/post.entity';

@Injectable()
export class EditorRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findPublicPostsByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('editors.userId = :userId', { userId })
      .andWhere('post.status = :status', { status: PostStatus.PUBLIC })
      .andWhere('post.teamId IS NULL')
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findTeamPublicPostsByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('editors.userId = :userId', { userId })
      .andWhere('post.status = :status', { status: PostStatus.PUBLIC })
      .andWhere('post.teamId IS NOT NULL')
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findPrivatePostsByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('editors.userId = :userId', { userId })
      .andWhere('post.status = :status', { status: PostStatus.PRIVATE })
      .andWhere('post.teamId IS NULL')
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findTeamPrivatePostsByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('editors.userId = :userId', { userId })
      .andWhere('post.status = :status', { status: PostStatus.PRIVATE })
      .andWhere('post.teamId IS NOT NULL')
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findDraftPostsByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('editors.userId = :userId', { userId })
      .andWhere('post.status = :status', { status: PostStatus.DRAFT })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }
}
