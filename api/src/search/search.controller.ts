import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Post } from 'src/post/post.entity';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async searchByTag(@Query('q') query: string): Promise<Post[]> {
    if (!query) {
      return { message: 'You have to write the message' };
    }
    return this.searchService.searchByTag(query);
  }

  @Get()
  async searchPostsByKeyword(keyword: string): Promise<Post[]> {
    return this.searchService.searchPostsByKeyword(keyword);
  }
}
