import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PostCardDto } from 'src/post/post.dto';
import { EditorService } from './editor.service';
import { JwtAuthGuard } from 'src/auth/jwt';

@Controller('editor')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

  @Get('/:id/posts/public')
  async getPublicPostsByUserId(
    @Param('id') userId: number,
  ): Promise<PostCardDto[]> {
    return await this.editorService.getPublicPostsByUserId(userId);
  }

  @Get('/:id/posts/team-public')
  async getTeamPublicPostsByUserId(
    @Param('id') userId: number,
  ): Promise<PostCardDto[]> {
    return await this.editorService.getTeamPublicPostsByUserId(userId);
  }

  @Get(':id/posts/private')
  @UseGuards(JwtAuthGuard)
  async getPrivatePostsByUserId(
    @Param('id') userId: number,
  ): Promise<PostCardDto[]> {
    return await this.editorService.getPrivatePostsByUserId(userId);
  }

  @Get(':id/posts/team-private')
  @UseGuards(JwtAuthGuard)
  async getTeamPrivatePostsByUserId(
    @Param('id') userId: number,
  ): Promise<PostCardDto[]> {
    return await this.editorService.getTeamPrivatePostsByUserId(userId);
  }

  @Get(':id/posts/draft')
  @UseGuards(JwtAuthGuard)
  async getDraftPostsByUserId(
    @Param('id') userId: number,
  ): Promise<PostCardDto[]> {
    return await this.editorService.getDraftPostsByUserId(userId);
  }
}
