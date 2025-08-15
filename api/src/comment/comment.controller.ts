import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CommentWithAuthor, CreateCommentDto } from './comment.dto';

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

  // ===== READ =====
  @Get('post/:postId')
  async getCommentsByPostId(
    @Param('postId') postId: number,
  ): Promise<CommentWithAuthor[]> {
    return await this.commentService.getCommentsByPostId(postId);
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
