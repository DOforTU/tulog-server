import {
  Controller,
  Delete,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentLikeService } from './comment-like.service';
import { JwtAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { CommentLike } from './comment-like.entity';

@Controller('comment-like')
export class CommentLikeController {
  constructor(private readonly commentLikeService: CommentLikeService) {}

  // ===== CREATE =====

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likeComment(
    @Request() req: { user: User },
    @Param('id') commentId: number,
  ): Promise<CommentLike> {
    return await this.commentLikeService.likeComment(req.user.id, commentId);
  }

  // ===== READ =====

  //  @Get('me')
  //  @UseGuards(JwtAuthGuard)
  //  async getLikedComments(
  //    @Request() req: { user: User },
  //  ): Promise<CommentLike[] | null> {
  //    return await this.commentLikeService.getLikedComments(req.user.id);
  //  }

  // ===== DELETE =====

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteLike(
    @Request() req: { user: User },
    @Param('id') commentId: number,
  ) {
    return await this.commentLikeService.deleteLike(req.user.id, commentId);
  }
}
