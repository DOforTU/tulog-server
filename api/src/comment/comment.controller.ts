import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { Comment } from './comment.entity';
import {
  CommentWithAuthor,
  CreateCommentDto,
  UpdateCommentDto,
} from './comment.dto';

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
    @Query('commentId') commentId?: number,
  ): Promise<Comment> {
    return await this.commentService.createComment(
      postId,
      req.user.id,
      createCommentDto,
      commentId,
    );
  }

  // ===== READ =====
  @Get('post/:postId')
  async getCommentsByPostId(
    @Param('postId') postId: number,
  ): Promise<CommentWithAuthor[]> {
    return this.commentService.getCommentsByPostId(postId);
  }
}
