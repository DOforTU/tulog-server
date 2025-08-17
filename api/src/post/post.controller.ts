import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post as PostMapping,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  CreatePostDto,
  DraftPostDto,
  UpdatePostDto,
  PostCardDto,
} from './post.dto';
import { Post } from './post.entity';
import { User } from 'src/user/user.entity';
import { JwtAuthGuard, SmartAuthGuard } from 'src/auth/jwt';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // ===== CREATE =====

  @PostMapping()
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: { user: User },
  ): Promise<Post> {
    return await this.postService.createPost(createPostDto, req.user.id);
  }

  @PostMapping('draft')
  @UseGuards(JwtAuthGuard)
  async draftPost(
    @Body() draftPostDto: DraftPostDto,
    @Request() req: { user: User },
  ): Promise<Post> {
    return await this.postService.draftPost(draftPostDto, req.user.id);
  }

  // ===== READ =====

  @Get('recent')
  async getRecentPosts(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PostCardDto[]> {
    return await this.postService.getRecentPosts(
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Get('featured')
  async getFeaturedPosts(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PostCardDto[]> {
    return await this.postService.getFeaturedPosts(
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Get(':id')
  async getPostById(
    @Param('id') id: number,
    @Request() req: any,
  ): Promise<Post> {
    const clientIp =
      req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    return await this.postService.readPostById(id, String(clientIp));
  }

  @Get('teams/:id/public')
  async getPublicPostsByTeamId(
    @Param('id') id: number,
  ): Promise<PostCardDto[]> {
    return await this.postService.getPublicPostsByTeamId(id);
  }

  @Get('teams/:id/private')
  @UseGuards(SmartAuthGuard)
  async getPrivatePostsByTeamId(
    @Param('id') id: number,
  ): Promise<PostCardDto[]> {
    return await this.postService.getPrivatePostsByTeamId(id);
  }

  // ===== UPDATE =====

  @Patch(':id')
  @UseGuards(SmartAuthGuard)
  async updatePost(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: { user: User },
  ): Promise<Post> {
    return await this.postService.updatePost(id, updatePostDto, req.user.id);
  }

  @Patch(':id/delete')
  @UseGuards(SmartAuthGuard)
  async softDeletePost(
    @Param('id') id: number,
    @Request() req: { user: User },
  ): Promise<boolean> {
    return await this.postService.softDeletePost(id, req.user.id);
  }
}
