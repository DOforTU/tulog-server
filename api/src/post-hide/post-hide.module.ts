import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostHide } from './post-hide.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostHide])],
  providers: [],
  controllers: [],
  exports: [],
})
export class PostHideModule {}
