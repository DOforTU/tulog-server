import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Post } from 'src/post/post.entity';
import { SearchPostDto } from './search.dto';
import { PostCardDto } from 'src/post/post.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // tag를 입력받으면 태그와 관련된 게시글, 유저 등 정보를 조회
  @Get('tag')
  async searchByTag(@Query('q') query: string): Promise<PostCardDto[]> {
    if (!query) {
      throw new BadRequestException('You have to write the message');
    }
    return this.searchService.searchByTag(query);
  }

  // 태그가 아닌 키워드 혹은 문장으로 검색했을 경우 관련된 게시글, 유저, 정보를 조회
  //  @Get('keyword')
  //  async searchPostsByKeyword(keyword: string): Promise<Post[]> {
  //    if (!keyword) {
  //      throw new BadRequestException('You have to write the message');
  //    }
  //    return this.searchService.searchPostsByKeyword(keyword);
  //  }
}
