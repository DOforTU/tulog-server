import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './comment.dto';
import { userInfo } from 'os';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // ===== CREATE =====
  @Post()
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Query('postId') postId: number,
    @Request() req: { user: User },
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return await this.commentService.createComment(
      postId,
      req.user.id,
      createCommentDto,
    );
  }

  // ===== DELETE =====
  @Delete(':id/posts/:postId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('id') commentId: number,
    @Param('postId') postId: number,
    @Request() req: { user: User },
  ): Promise<void> {
    return await this.commentService.deleteComment(
      commentId,
      postId,
      req.user.id,
    );
  }
}
