import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from './post.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
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

  async findFeaturedPosts(
    limit: number = 20,
    offset: number = 0,
  ): Promise<Post[]> {
    // 시간 가중치를 적용한 인기순으로 정렬 후 포스트 ID만 가져오기
    /**
     *   시간 가중치:
     * - 오늘 작성: 1 + 1.0 / (1 + 0) = 2.0 (2배 부스트)
     * - 1일 전: 1 + 1.0 / (1 + 1) = 1.5 (1.5배 부스트)
     * - 7일 전: 1 + 1.0 / (1 + 7) = 1.125 (1.125배 부스트)
     * - 30일 전: 1 + 1.0 / (1 + 30) ≈ 1.03 (거의 원점수)
     */
    const postIds = await this.postRepository
      .createQueryBuilder('post')
      .select('post.id')
      .addSelect(
        `(post.likeCount * 0.7 + post.viewCount * 0.2 + post.commentCount * 0.1) * 
         (1 + 1.0 / (1 + EXTRACT(EPOCH FROM (NOW() - post.createdAt)) / 86400))`,
        'popularity_score',
      )
      .where('post.status = :status', { status: 'PUBLIC' })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('popularity_score', 'DESC')
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
      .addSelect(
        `(post.likeCount * 0.7 + post.viewCount * 0.2 + post.commentCount * 0.1) * 
         (1 + 1.0 / (1 + EXTRACT(EPOCH FROM (NOW() - post.createdAt)) / 86400))`,
        'popularity_score',
      )
      .where('post.id IN (:...ids)', { ids: postIds.map((p) => p.id) })
      .orderBy('popularity_score', 'DESC')
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

  // ===== SUB FUNCTION =====

  async isOwner(postId: number, userId: number): Promise<User | null> {
    return await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .innerJoin('user.editors', 'editor')
      .innerJoin('editor.post', 'post')
      .where('post.id = :postId', { postId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('editor.role = :role', { role: 'OWNER' })
      .getOne();
  }

  // query로 연관된 게시글 가지고 오기
  // 태그 검색으로 게시글 가져오기
  async findPostsByQuery(query: string): Promise<Post[] | null> {
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.postTags', 'postTag')
      .leftJoinAndSelect('postTag.tag', 'tag')
      .leftJoinAndSelect('post.editors', 'editor')
      .leftJoinAndSelect('editor.user', 'user')
      .where('LOWER(tag.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(post.title) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(post.content) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .getMany();
  }

  //// 해당 키워드로 연관된 게시글 가지고 오기
  //async findPostsByKeyword(query: string): Promise<Post[]> {
  //  return this.postRepository
  //    .createQueryBuilder('post')
  //    .leftJoinAndSelect('post.tags', 'tag')
  //    .where('tag.name LIKE :query', { query: `%${query}%` })
  //    .orWhere('post.title LIKE :query', { query: `%${query}%` })
  //    .orWhere('post.content LIKE :query', { query: `%${query}%` })
  //    .getMany();
  //}
}
