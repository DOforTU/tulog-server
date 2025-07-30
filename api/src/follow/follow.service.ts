import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';

@Injectable()
export class FollowService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,
  ) {}

  async followUser(followerId: number, followingId: number) {
    // 중복 체크 등 로직 추가 가능
    const follow = this.followRepository.create({ followerId, followingId });
    return this.followRepository.save(follow);
}
}
