import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async searchByTag(@Query('q') query: string) {
    if (!query) {
      return { message: 'You have to write the message' };
    }
    return this.searchService.searchByTag(query);
  }
}
