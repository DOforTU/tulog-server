import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { UserBlockRepository } from './user-block.repository';
import { UserBlock } from './user-block.entity';

@Injectable()
export class UserBlockService {
  constructor(
    private readonly userService: UserService,
    private readonly userBlockRepository: UserBlockRepository,
  ) {}

  async blockUser(blockerId: number, blockedId: number): Promise<UserBlock> {
    if (blockerId === blockedId) {
      throw new BadRequestException('Cannot block yourself.');
    }

    // check if blocked user exists
    await this.userService.getUserById(blockedId);

    const isBlocking = await this.userBlockRepository.isBlocking(
      blockerId,
      blockedId,
    );

    if (isBlocking) {
      throw new ConflictException('User is already blocked.');
    }

    return await this.userBlockRepository.blockUser(blockerId, blockedId);
  }

  /** 차단한 유저들을 조회하려고 하는데
   * 아이디로 유저가 존재하는지 진행 후 ,
   * 유저 아이디로 차단한 사용자를 user변수에 담는다 (아마 리스트로? 많을수도있으니까)
   *
   */
  async getBlockUsers(userId: number): Promise<User[] | null> {
    // check if the user exists
    await this.userService.getUserById(userId);

    // user will be null, when no blocked user exist
    const user = await this.userService.findUserWithBlockedById(userId);
    if (!user) {
      return [];
    }

    return user.blockers.map((b) => b.blocked);
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<boolean> {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }

    // check if blocked user exists
    await this.userService.getUserById(blockedId);

    // check if blocked user exists
    const isBlocking = await this.userBlockRepository.isBlocking(
      blockerId,
      blockedId,
    );

    // 차단한지 확인하고 차단
    if (!isBlocking) {
      throw new ConflictException('You are not blocking this user');
    }

    return await this.userBlockRepository.unblockUser(blockerId, blockedId);
  }
}
