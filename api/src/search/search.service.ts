import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async searchByTag(query: string) {
    return await this.searchRepository.findPostsByTag(query);
  }
}
