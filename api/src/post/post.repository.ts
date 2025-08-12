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

  async findByIdWithEditors(id: number): Promise<Post | null> {
    return await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.editors', 'editors')
      .leftJoinAndSelect('editors.user', 'user')
      .leftJoinAndSelect('post.team', 'team')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('post.id = :id', { id })
      .getOne();
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
