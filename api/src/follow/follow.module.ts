import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './follow.entity';
import { User } from 'src/user/user.entity';
import { FollowRepository } from './follow.repository';
import { UserModule } from 'src/user/user.module';
import { NoticeModule } from 'src/notice/notice.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User]), UserModule, NoticeModule],
  providers: [FollowService, FollowRepository],
  controllers: [FollowController],
  exports: [FollowService, FollowRepository],
})
export class FollowModule {}
