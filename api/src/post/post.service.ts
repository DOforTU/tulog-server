import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Post, PostStatus } from './post.entity';
import {
  CreatePostDto,
  DraftPostDto,
  UpdatePostDto,
  PublicPostDto,
} from './post.dto';
import { PostRepository } from './post.repository';
import { TeamMemberService } from 'src/team-member/team-member.service';
import { Editor, EditorRole } from 'src/editor/editor.entity';
import { Tag } from 'src/tag/tag.entity';
import { PostTag } from 'src/post-tag/post-tag.entity';
import { ConfigService } from '@nestjs/config';
import { toPublicUser } from 'src/common/helper/to-public-user';
import { User } from 'src/user/user.entity';

@Injectable()
export class PostService {
  constructor(
    private readonly configService: ConfigService,
    private readonly postRepository: PostRepository,
    private readonly teamMemberService: TeamMemberService,
    private readonly dataSource: DataSource,
  ) {}

  // ===== CREATE =====

  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<Post> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const postData = {
        title: createPostDto.title,
        content: createPostDto.content,
        excerpt: createPostDto.excerpt,
        thumbnailImage:
          createPostDto.thumbnailImage ||
          this.configService.get('DEFAULT_THUMBNAIL_IMAGE_URL'),
        status: createPostDto.status || PostStatus.PRIVATE,
        teamId: createPostDto.teamId,
      };

      const createdPost = await queryRunner.manager.save(Post, postData);

      await this.handleEditorsCreation(
        queryRunner.manager,
        createdPost.id,
        createPostDto.teamId,
        userId,
      );
      await this.handleTagsCreation(
        queryRunner.manager,
        createdPost.id,
        createPostDto.tags,
      );

      await queryRunner.commitTransaction();

      return await this.getPostWithEditors(createdPost.id);
    } catch (error: any) {
      console.error('create post error:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed creating post');
    } finally {
      await queryRunner.release();
    }
  }

  async draftPost(draftPostDto: DraftPostDto, userId: number): Promise<Post> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const postData = {
        title: draftPostDto.title,
        content: draftPostDto.content,
        excerpt: draftPostDto.excerpt,
        thumbnailImage: draftPostDto.thumbnailImage,
        status: PostStatus.DRAFT,
        teamId: draftPostDto.teamId,
      };

      const createdPost = await queryRunner.manager.save(Post, postData);

      await this.handleEditorsCreation(
        queryRunner.manager,
        createdPost.id,
        draftPostDto.teamId,
        userId,
      );
      await this.handleTagsCreation(
        queryRunner.manager,
        createdPost.id,
        draftPostDto.tags,
      );

      await queryRunner.commitTransaction();

      return await this.getPostWithEditors(createdPost.id);
    } catch (error: any) {
      console.error('draft post error:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed creating draft post');
    } finally {
      await queryRunner.release();
    }
  }

  // ===== READ =====

  async getPostById(id: number): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async getPostWithEditors(id: number): Promise<Post> {
    const post = await this.postRepository.findByIdWithEditors(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async getPublicPosts(
    limit: number = 20,
    offset: number = 0,
  ): Promise<PublicPostDto[]> {
    console.log(`getPublicPosts 호출: limit=${limit}, offset=${offset}`);

    const posts = await this.postRepository.findPublicPostsOrderByLatest(
      limit,
      offset,
    );

    return posts.map((post) => this.transformToPublicPostDto(post));
  }

  // ===== UPDATE =====

  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ): Promise<Post> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingPost = await this.postRepository.findByIdWithEditors(id);
      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }

      const userEditor = existingPost.editors.find(
        (editor) => editor.userId === userId,
      );
      if (
        !userEditor ||
        (userEditor.role !== EditorRole.OWNER &&
          userEditor.role !== EditorRole.EDITOR)
      ) {
        throw new ForbiddenException(
          'You do not have permission to edit this post',
        );
      }

      const updateData: Partial<Post> = {};
      if (updatePostDto.title !== undefined)
        updateData.title = updatePostDto.title;
      if (updatePostDto.content !== undefined)
        updateData.content = updatePostDto.content;
      if (updatePostDto.excerpt !== undefined)
        updateData.excerpt = updatePostDto.excerpt;
      if (updatePostDto.thumbnailImage !== undefined)
        updateData.thumbnailImage = updatePostDto.thumbnailImage;
      if (updatePostDto.status !== undefined)
        updateData.status = updatePostDto.status;
      if (updatePostDto.teamId !== undefined)
        updateData.teamId = updatePostDto.teamId;

      if (Object.keys(updateData).length > 0) {
        await this.postRepository.updatePost(id, updateData);
      }

      if (updatePostDto.tags !== undefined) {
        await this.handleTagsUpdate(
          queryRunner.manager,
          id,
          updatePostDto.tags,
        );
      }

      if (
        updatePostDto.teamId !== undefined &&
        updatePostDto.teamId !== existingPost.teamId
      ) {
        await this.handleEditorsUpdate(
          queryRunner.manager,
          id,
          updatePostDto.teamId,
          userId,
        );
      }

      await queryRunner.commitTransaction();

      return await this.getPostWithEditors(id);
    } catch (error: any) {
      console.error('update post error:', error);
      await queryRunner.rollbackTransaction();
      throw error instanceof NotFoundException ||
        error instanceof ForbiddenException
        ? error
        : new InternalServerErrorException('Failed updating post');
    } finally {
      await queryRunner.release();
    }
  }

  // ===== SUB FUNCTIONS =====

  private async handleEditorsCreation(
    manager: any,
    postId: number,
    teamId: number | undefined,
    userId: number,
  ): Promise<void> {
    if (teamId) {
      const teamMembers =
        await this.teamMemberService.getJoinedTeamMembersByTeamId(teamId);

      for (const teamMember of teamMembers) {
        const role =
          teamMember.memberId === userId ? EditorRole.OWNER : EditorRole.EDITOR;
        await manager.save(Editor, {
          postId: postId,
          userId: teamMember.memberId,
          role: role,
        });
      }
    } else {
      await manager.save(Editor, {
        postId: postId,
        userId: userId,
        role: EditorRole.OWNER,
      });
    }
  }

  private async handleTagsCreation(
    manager: any,
    postId: number,
    tagNames?: string[],
  ): Promise<void> {
    if (!tagNames || tagNames.length === 0) {
      return;
    }

    for (const tagName of tagNames) {
      let tag = await manager.findOne(Tag, { where: { name: tagName } });

      if (!tag) {
        tag = await manager.save(Tag, { name: tagName });
      }

      await manager.save(PostTag, {
        postId: postId,
        tagId: tag.id,
      });
    }
  }

  private async handleTagsUpdate(
    manager: any,
    postId: number,
    tagNames: string[],
  ): Promise<void> {
    await manager.delete('PostTag', { postId });

    if (tagNames.length === 0) {
      return;
    }

    for (const tagName of tagNames) {
      let tag = await manager.findOne(Tag, { where: { name: tagName } });

      if (!tag) {
        tag = await manager.save(Tag, { name: tagName });
      }

      await manager.save(PostTag, {
        postId: postId,
        tagId: tag.id,
      });
    }
  }

  private async handleEditorsUpdate(
    manager: any,
    postId: number,
    teamId: number | null,
    userId: number,
  ): Promise<void> {
    await manager.delete('Editor', { postId });

    if (teamId) {
      const teamMembers =
        await this.teamMemberService.getJoinedTeamMembersByTeamId(teamId);

      for (const teamMember of teamMembers) {
        const role =
          teamMember.memberId === userId ? EditorRole.OWNER : EditorRole.EDITOR;
        await manager.save(Editor, {
          postId: postId,
          userId: teamMember.memberId,
          role: role,
        });
      }
    } else {
      await manager.save(Editor, {
        postId: postId,
        userId: userId,
        role: EditorRole.OWNER,
      });
    }
  }

  private transformToPublicPostDto(post: Post): PublicPostDto {
    const owners = post.editors.filter(
      (editor) => editor.role === EditorRole.OWNER,
    );
    const editors = post.editors.filter(
      (editor) => editor.role === EditorRole.EDITOR,
    );

    const authors = [
      ...owners.map((editor) => toPublicUser(editor.user)),
      ...editors.map((editor) => toPublicUser(editor.user)),
    ];

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      thumbnailImage: post.thumbnailImage,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      teamId: post.teamId,
      teamName: post.team?.name,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags: post.postTags.map((postTag) => postTag.tag.name),
      authors,
    };
  }

  //async isOwner(postId: number, userId: number): Promise<User | null> {
  //  return await this.postRepository.isOwner(postId, userId);
  //}
}
