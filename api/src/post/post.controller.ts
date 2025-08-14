import {
  Body,
  Controller,
  Delete,
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
  PublicPostDto,
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

  @Get()
  async getPublicPosts(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PublicPostDto[]> {
    return await this.postService.getPublicPosts(
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

  // ===== DELETE =====

  @Delete(':id')
  @UseGuards(SmartAuthGuard)
  async deletePost(
    @Param('id') id: number,
    @Request() req: { user: User },
  ): Promise<boolean> {
    return await this.postService.deletePost(id, req.user.id);
  }
}
