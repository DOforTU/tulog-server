import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // ===== CREATE =====

  async createPost(postData: Partial<Post>): Promise<Post> {
    const post = this.postRepository.create(postData);
    return await this.postRepository.save(post);
  }

  // ===== READ =====

  async findById(id: number): Promise<Post | null> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('post.id = :id', { id })
      .getOne();
  }

  // async findByIdWithEditors(id: number): Promise<Post | null> {
  //   return await this.postRepository
  //     .createQueryBuilder('post')
  //     .leftJoinAndSelect('post.team', 'team')
  //     .leftJoinAndSelect('post.editors', 'editors')
  //     .leftJoinAndSelect('editors.user', 'user')
  //     .leftJoinAndSelect('post.postTags', 'postTags')
  //     .leftJoinAndSelect('postTags.tag', 'tag')
  //     .where('post.id = :id', { id })
  //     .getOne();
  // }

  async findPublicPostsOrderByLatest(
    limit: number = 20,
    offset: number = 0,
  ): Promise<Post[]> {
    // 먼저 포스트 ID만 가져오기
    const postIds = await this.postRepository
      .createQueryBuilder('post')
      .select('post.id')
      .where('post.status = :status', { status: 'PUBLIC' })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    if (postIds.length === 0) {
      return [];
    }

    // 해당 ID의 포스트들을 관계와 함께 조회
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('post.id IN (:...ids)', { ids: postIds.map((p) => p.id) })
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findPublicPostsByTeamId(teamId: number): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('post.teamId = :teamId', { teamId })
      .andWhere('post.status = :status', { status: 'PUBLIC' })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findPrivatePostsByTeamId(teamId: number): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('post.teamId = :teamId', { teamId })
      .andWhere('post.status = :status', { status: 'PRIVATE' })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findDraftPostsByTeamId(teamId: number): Promise<Post[]> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('post.teamId = :teamId', { teamId })
      .andWhere('post.status = :status', { status: 'DRAFT' })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  // ===== UPDATE =====

  async updatePost(id: number, updateData: Partial<Post>): Promise<void> {
    await this.postRepository
      .createQueryBuilder()
      .update(Post)
      .set(updateData)
      .where('id = :id', { id })
      .execute();
  }
}
