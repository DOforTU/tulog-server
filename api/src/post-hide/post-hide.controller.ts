import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt';
import { PostHide } from './post-hide.entity';
import { User } from 'src/user/user.entity';
import { PostService } from 'src/post/post.service';
import { PostHideService } from './post-hide.service';

@Controller('post-hide')
export class PostHideController {
  constructor(private readonly postHideService: PostHideService) {}

  // ===== CREATE =====

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  async hidePost(
    @Param('postId') postId: number,
    @Request() req: { user: User },
  ) {
    return await this.postHideService.hidePost(postId, req.user.id);
  }

  // ===== UPDATE =====
  @Patch(':postId')
  @UseGuards(JwtAuthGuard)
  async deleteHide(
    @Param('postId') postId: number,
    @Request() req: { user: User },
  ): Promise<boolean> {
    return await this.postHideService.deleteHide(postId, req.user.id);
  }
}
