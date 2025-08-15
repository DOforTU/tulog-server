import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { PostLike } from './post-like.entity';
import { SmartAuthGuard } from 'src/auth/jwt';
import { PostLikeService } from './post-like.service';
import { PostCardDto } from 'src/post/post.dto';

@Controller('posts')
export class PostLikeController {
  constructor(private readonly postLikeService: PostLikeService) {}

  // ===== CREATE =====

  @Post(':id/like')
  @UseGuards(SmartAuthGuard)
  async likePost(
    @Request() req: { user: User },
    @Param('id') postId: number,
  ): Promise<PostLike> {
    return await this.postLikeService.likePost(req.user.id, postId);
  }

  // ===== READ =====

  /** Get like count for a post */
  @Get(':id/likes/count')
  async getLikeCount(@Param('id') postId: number): Promise<number> {
    return await this.postLikeService.getLikeCount(postId);
  }

  /** Check if user liked a post */
  @Get(':id/likes/me')
  @UseGuards(SmartAuthGuard)
  async isLiked(
    @Request() req: { user: User },
    @Param('id') postId: number,
  ): Promise<boolean> {
    return await this.postLikeService.isLiked(req.user.id, postId);
  }

  /** Get users who liked a post */
  @Get(':id/likes')
  async getLikes(@Param('id') postId: number): Promise<User[]> {
    return await this.postLikeService.getLikes(postId);
  }

  /** Get posts user liked */
  @Get('liked/me')
  @UseGuards(SmartAuthGuard)
  async getLikedPostsByUser(
    @Request() req: { user: User },
  ): Promise<PostCardDto[] | null> {
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    return await this.postLikeService.getLikedPostsByUser(req.user.id);
  }

  // ===== DELETE =====

  @Delete(':id/unlike')
  @UseGuards(SmartAuthGuard)
  async unlikePost(
    @Request() req: { user: User },
    @Param('id') postId: number,
  ): Promise<boolean> {
    return await this.postLikeService.unlikePost(req.user.id, postId);
  }
}
