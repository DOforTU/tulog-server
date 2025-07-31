import { Injectable } from '@nestjs/common';
import { Follow } from './follow.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FollowRepository extends Repository<Follow> {
  // // 팔로우 중복 체크
  // async isFollowing(followerId: number, followingId: number): Promise<boolean> {
  //   const count = await this.count({ where: { followerId, followingId } });
  //   return count > 0;
  // }
  // // 팔로워 수 조회
  // async countFollowers(userId: number): Promise<number> {
  //   return this.count({ where: { followingId: userId } });
  // }
  // // 팔로잉 수 조회
  // async countFollowings(userId: number): Promise<number> {
  //   return this.count({ where: { followerId: userId } });
  // }
}
