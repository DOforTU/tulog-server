import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Search } from './search.entity';
import { Repository } from 'typeorm';
import { Post } from 'src/post/post.entity';

@Injectable()
export class SearchRepository {
  constructor(
    @InjectRepository(Search)
    private readonly searchRepository: Repository<Search>,
  ) {}

  // 태그 검색으로 게시글 가져오기
  async findPostsByTag(tagName: string): Promise<Post[]> {
    const posts = this.searchRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .where('tag.name LIKE :query', { query: `%${tagName}%` })
      .orWhere('post.title LIKE :query', { query: `%${tagName}%` })
      .orWhere('post.content LIKE :query', { query: `%${tagName}%` })
      .getMany();
    return posts;
  }

  // 태그로 관련 유저 찾아오기
  async findUsersByTag(tagName: string) {
    // Post, Tag 리포지토리 추가해서 쿼리 사용.
  }
}
