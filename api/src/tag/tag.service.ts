import { Injectable } from '@nestjs/common';
import { TagRepository } from './tag.repository';

export interface PopularTag {
  id: number;
  name: string;
  usageCount: number;
}

interface RawTagData {
  id: string | number;
  name: string;
  usageCount: string | number;
}

@Injectable()
export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  async getPopularTags(limit: number = 10): Promise<PopularTag[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rawTags = await this.tagRepository.findPopularTagsByPeriod(
      sevenDaysAgo,
      limit,
    );

    return rawTags.map((tag: RawTagData) => ({
      id: Number(tag.id),
      name: String(tag.name),
      usageCount: Number(tag.usageCount),
    }));
  }
}
