import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostHide } from './post-hide.entity';
import { PostHideController } from './post-hide.controller';
import { PostHideService } from './post-hide.service';
import { PostHideRepository } from './post-hide.repository';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostHide]), PostModule],
  providers: [PostHideService, PostHideRepository],
  controllers: [PostHideController],
  exports: [PostHideService, PostHideRepository],
})
export class PostHideModule {}
