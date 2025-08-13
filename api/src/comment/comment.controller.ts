import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { Comment } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // ===== CREATE =====
  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async commentAtPost(
    @Param('postId') postId: number,
    @Request() req: { user: User },
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return await this.commentService.commentAtPost(
      postId,
      req.user.id,
      createCommentDto,
    );
  }

  // ===== UPDATE =====
  /**
   *
   * @param id 게시글 아이디
   * @param req 유저 아이디
   * @returns
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async changeComment(
    @Param('id') id: number,
    @Request() req: { user: User },
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return await this.commentService.changeComment(
      id,
      req.user.id,
      updateCommentDto,
    );
  }
}
