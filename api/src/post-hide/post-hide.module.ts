import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostHide } from './post-hide.entity';
import { PostHideController } from './post-hide.controller';
import { PostHideService } from './post-hide.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostHide])],
  providers: [PostHideService],
  controllers: [PostHideController],
  exports: [],
})
export class PostHideModule {}
