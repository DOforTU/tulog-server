import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './follow.entity';
import { User } from 'src/user/user.entity';
import { FollowRepository } from './follow.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User, FollowRepository]),],
  providers: [FollowService],
  controllers: [FollowController]
})
export class FollowModule {}
