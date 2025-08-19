import { Controller, Get, Query } from '@nestjs/common';
import { TagService, PopularTag } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('popular')
  async getPopularTags(@Query('limit') limit?: string): Promise<PopularTag[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.tagService.getPopularTags(limitNumber);
  }
}
