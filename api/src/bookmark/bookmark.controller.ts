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

  // ===== DELETE =====

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  async deleteBookMark(
    @Request() req: { user: User },
    @Param('pstId') postId: number,
  ): Promise<boolean> {
    return await this.bookmarkService.deleteBookMark(req.user.id, postId);
  }
}
