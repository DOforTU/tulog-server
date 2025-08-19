import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { PostService } from 'src/post/post.service';
import { PostCardDto } from 'src/post/post.dto';
import { PublicUser } from 'src/user/user.dto';

export class SearchResponseDto {
  posts: PostCardDto[];
  users: PublicUser[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly searchRepository: SearchRepository,
    private readonly postService: PostService,
  ) {}

  // tag를 쿼리로 검색받으면 관련된 게시글과 유저정보가 나와야함
  // 쿼리와 연결
  async searchByTag(query: string): Promise<PostCardDto[]> {
    const posts = await this.postService.findPostsByTag(query);
    // TODO: User도 가져옴
    return posts;
  }

  //  async searchPostsByKeyword(keyword: string): Promise<PostCardDto[]> {
  //    return await this.postService.findPostsByKeyword(keyword);
  //  }
}
