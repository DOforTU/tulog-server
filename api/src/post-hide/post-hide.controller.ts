import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt';
import { PostHide } from './post-hide.entity';
import { User } from 'src/user/user.entity';
import { PostService } from 'src/post/post.service';

@Controller('post-hide')
export class PostHideController {
  constructor(private readonly postService: PostService) {}

  // ===== CREATE =====

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPostHide(@Request() req: { user: User }): Promise<PostHide> {
    return await this.postService.createPostHide(req.user.id);
  }
}
