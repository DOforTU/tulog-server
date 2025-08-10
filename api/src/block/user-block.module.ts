import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBlockController } from './user-block.controller';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { Module } from '@nestjs/common';
import { UserBlock } from './user-block.entity';
import { UserBlockService } from './user-block.service';
import { UserBlockRepository } from './user-block.repository';
import { Follow } from 'src/follow/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserBlock, User, Follow]), UserModule],
  providers: [UserBlockService, UserBlockRepository],
  controllers: [UserBlockController],
  exports: [UserBlockService, UserBlockRepository],
})
export class UserBlcokModule {}
