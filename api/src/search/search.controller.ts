import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { SearchResponseDto, SearchService } from './search.service';
import { SearchPostDto } from './search.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // tag를 입력받으면 태그와 관련된 게시글, 유저 등 정보를 조회
  // 유저 혹은 게시글 정보를 못불러올 수 있으니 null로도 반환가능
  @Get()
  async searchByTag(
    @Query('q') query: string,
  ): Promise<SearchResponseDto | null> {
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
