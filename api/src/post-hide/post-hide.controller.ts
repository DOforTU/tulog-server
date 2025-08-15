import {
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { PostHideService } from './post-hide.service';
import { PostHide } from './post-hide.entity';

@Controller('hide/posts')
export class PostHideController {
  constructor(private readonly postHideService: PostHideService) {}

  // ===== CREATE =====

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  async hidePost(
    @Param('postId') postId: number,
    @Request() req: { user: User },
  ): Promise<PostHide> {
    return await this.postHideService.hidePost(postId, req.user.id);
  }

  // ===== DELETE =====

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  async deleteHide(
    @Param('postId') postId: number,
    @Request() req: { user: User },
  ): Promise<boolean> {
    return await this.postHideService.deleteHide(postId, req.user.id);
  }
}
