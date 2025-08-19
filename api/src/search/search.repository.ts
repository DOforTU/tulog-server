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
}
