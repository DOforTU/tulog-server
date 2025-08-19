import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

interface RawTagData {
  id: string | number;
  name: string;
  usageCount: string | number;
}

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findPopularTagsByPeriod(
    startDate: Date,
    limit: number,
  ): Promise<RawTagData[]> {
    return await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.postTags', 'postTag')
      .select([
        'tag.id as id',
        'tag.name as name',
        'COUNT(postTag.tagId) as usageCount',
      ])
      .where('postTag.createdAt >= :startDate', { startDate })
      .groupBy('tag.id, tag.name')
      .orderBy('usageCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
