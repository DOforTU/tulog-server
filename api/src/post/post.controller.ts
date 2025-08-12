import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post as PostMapping,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, DraftPostDto, UpdatePostDto } from './post.dto';
import { Post } from './post.entity';
import { User } from 'src/user/user.entity';
import { SmartAuthGuard } from 'src/auth/jwt';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // ===== CREATE =====

  @PostMapping()
  @UseGuards(SmartAuthGuard)
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: { user: User },
  ): Promise<Post> {
    return await this.postService.createPost(createPostDto, req.user.id);
  }

  @PostMapping('draft')
  @UseGuards(SmartAuthGuard)
  async draftPost(
    @Body() draftPostDto: DraftPostDto,
    @Request() req: { user: User },
  ): Promise<Post> {
    return await this.postService.draftPost(draftPostDto, req.user.id);
  }

  // ===== READ =====

  @Get(':id')
  async getPostById(@Param('id') id: number): Promise<Post> {
    return await this.postService.getPostById(id);
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
}
