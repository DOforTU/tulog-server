import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserBlock } from './user-block.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserBlockRepository {
  constructor(
    @InjectRepository(UserBlock)
    private readonly userBlockRepository: Repository<UserBlock>,
  ) {}

  /** check if the blocked user exists */
  async isBlocking(blockerId: number, blockedId: number): Promise<boolean> {
    const isBlocking = await this.userBlockRepository.findOne({
      where: { blockerId, blockedId },
    });
    return isBlocking !== null;
  }

  /** block a user */
  async blockUser(blockerId: number, blockedId: number): Promise<UserBlock> {
    const blcok = this.userBlockRepository.create({ blockerId, blockedId });
    return await this.userBlockRepository.save(blcok);
  }

  /** Unfollow a user */
  async unblockUser(blockerId: number, blockedId: number): Promise<boolean> {
    await this.userBlockRepository.delete({ blockerId, blockedId });
    return true;
  }
}
