import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { Bookmark } from './bookmark.entity';
import { PostCardDto } from 'src/post/post.dto';

@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  // ===== CREATE =====

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  async bookmarkPost(
    @Request() req: { user: User },
    @Param('postId') postId: number,
  ): Promise<Bookmark> {
    return await this.bookmarkService.bookmarkPost(req.user.id, postId);
  }

  // ===== READ =====

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMarkedPost(
    @Request() req: { user: User },
  ): Promise<PostCardDto[] | null> {
    return await this.bookmarkService.getMarkedPost(req.user.id);
  }

  // ===== DELETE =====

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  async deleteBookMark(
    @Request() req: { user: User },
    @Param('postId') postId: number,
  ): Promise<boolean> {
    return await this.bookmarkService.deleteBookMark(req.user.id, postId);
  }
}
