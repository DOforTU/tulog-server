import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { UserBlockRepository } from './user-block.repository';
import { UserBlock } from './user-block.entity';
import { Follow } from 'src/follow/follow.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class UserBlockService {
  constructor(
    private readonly userService: UserService,
    private readonly userBlockRepository: UserBlockRepository,
    private readonly dataSource: DataSource,
  ) {}

  // ===== CREATE =====

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

    // Use transaction to ensure data consistency when blocking and removing follow relationships
    return await this.dataSource.transaction(async (manager) => {
      // 1. Create block relationship
      const blockRelation =
        await this.userBlockRepository.blockUserWithTransaction(
          blockerId,
          blockedId,
          manager,
        );

      // 2. Remove existing follow relationships (both directions)
      // Check if blocker follows blocked user and remove
      const blockerFollowsBlocked = await manager
        .getRepository(Follow)
        .findOne({
          where: { followerId: blockerId, followingId: blockedId },
        });
      if (blockerFollowsBlocked) {
        await manager.getRepository(Follow).delete({
          followerId: blockerId,
          followingId: blockedId,
        });
      }

      // Check if blocked user follows blocker and remove
      const blockedFollowsBlocker = await manager
        .getRepository(Follow)
        .findOne({
          where: { followerId: blockedId, followingId: blockerId },
        });
      if (blockedFollowsBlocker) {
        await manager.getRepository(Follow).delete({
          followerId: blockedId,
          followingId: blockerId,
        });
      }

      return blockRelation;
    });
  }

  // ===== READ =====

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

  // ===== DELETE =====

  /**
   *
   * @param blockerId 차단하려는 사용자
   * @param blockedId 차단 당하는 사용자
   * @returns 차단이 된 상태인지 체크해야함 엉뚱한 사람 차단 취소를 하면 안되니까
   * block테이블에 사용자랑 차단 당한 사용자를 삭제하면 차단 취소
   *
   */
  async unblockUser(blockerId: number, blockedId: number): Promise<boolean> {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }

    // check if blocked user exists
    //차단 취소 하려는 사용자를 아이디를 통해서 찾고
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
