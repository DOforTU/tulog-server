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
  PostCardDto,
} from './post.dto';
import { PostRepository } from './post.repository';
import { TeamMemberService } from 'src/team-member/team-member.service';
import { Editor, EditorRole } from 'src/editor/editor.entity';
import { Tag } from 'src/tag/tag.entity';
import { PostTag } from 'src/post-tag/post-tag.entity';
import { ConfigService } from '@nestjs/config';
import { toPublicUser } from 'src/common/helper/to-public-user';
import { SearchResponseDto } from 'src/search/search.service';
import { PublicUser } from 'src/user/user.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class PostService {
  private viewCache = new Map<string, number>();

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

      return await this.getPostById(createdPost.id);
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
        thumbnailImage:
          draftPostDto.thumbnailImage ||
          this.configService.get('DEFAULT_THUMBNAIL_IMAGE_URL'),
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

      return await this.getPostById(createdPost.id);
    } catch (error: any) {
      console.error('draft post error:', error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed creating draft post');
    } finally {
      await queryRunner.release();
    }
  }

  // ===== READ =====

  async readPostById(id: number, clientIp?: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // view count increment with duplicate prevention
    if (clientIp) {
      const cacheKey = `view:${id}:${clientIp}`;
      const now = Date.now();
      const lastView = this.viewCache.get(cacheKey);

      // Only increment if no recent view from same IP (within 10 minutes)
      if (!lastView || now - lastView > 10 * 60 * 1000) {
        post.viewCount += 1;
        await this.postRepository.updatePost(post.id, {
          viewCount: post.viewCount,
        });
        this.viewCache.set(cacheKey, now);

        // Clean old cache entries (older than 1 hour)
        this.cleanOldCacheEntries();
      }
    } else {
      // Fallback: increment anyway if no IP
      post.viewCount += 1;
      await this.postRepository.updatePost(post.id, {
        viewCount: post.viewCount,
      });
    }

    return post;
  }

  async getPostById(id: number): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getRecentPosts(
    limit: number = 20,
    offset: number = 0,
  ): Promise<PostCardDto[]> {
    const posts = await this.postRepository.findPublicPostsOrderByLatest(
      limit,
      offset,
    );

    return posts.map((post) => this.transformToPublicPostDto(post));
  }

  async getFeaturedPosts(
    limit: number = 20,
    offset: number = 0,
  ): Promise<PostCardDto[]> {
    const posts = await this.postRepository.findFeaturedPosts(limit, offset);

    return posts.map((post) => this.transformToPublicPostDto(post));
  }

  async getPublicPostsByTeamId(teamId: number): Promise<PostCardDto[]> {
    const posts = await this.postRepository.findPublicPostsByTeamId(teamId);
    return posts.map((post) => this.transformToPublicPostDto(post));
  }

  async getPrivatePostsByTeamId(teamId: number): Promise<PostCardDto[]> {
    const posts = await this.postRepository.findPrivatePostsByTeamId(teamId);
    return posts.map((post) => this.transformToPublicPostDto(post));
  }

  async getDraftPostsByTeamId(teamId: number): Promise<PostCardDto[]> {
    const posts = await this.postRepository.findDraftPostsByTeamId(teamId);
    return posts.map((post) => this.transformToPublicPostDto(post));
  }

  // tag를 통해서 관련 게시글 정보를 가져온다.
  // 게시글 유무는 확인하지 않아도 됨 왜냐면 있는 게시글한에서 가져오기 때문
  // post는 사용자에서 postcardDto형태로 보여줌
  async findPostsByTag(query: string): Promise<PostCardDto[]> {
    const posts = (await this.postRepository.findPostsByTag(query)) || [];
    return posts.map((post) => this.transformToPublicPostDto(post));
  }

  // 태그로 관련 유저정보만 가져옴
  //
  async findUserByTag(query: string): Promise<PublicUser[]> {
    const posts: Post[] =
      (await this.postRepository.findPostsByTag(query)) || [];
    const users: User[] = [];
    for (const post of posts) {
      if (post.editors) {
        post.editors
          .filter((editor) => editor.role === EditorRole.OWNER && editor.user)
          .forEach((editor) => users.push(editor.user));
        // .filter에서 편집자 배열중 역할이 owner이고 user정보가 있는 편집자만 필터
        // .forEach에서 그 편집자들의 user 객체만 꺼내서 users 배열의 push해서 게시글 작성한 유저정보를 필터링
      }
    }

    // 유저 배열에서 Map을 통해 users 안에 객체를 u.id,u로 변경하고 .value로 고유 값을 반환
    // map으로 user가 topublic으로 리턴
    const uniqueUsers: User[] = Array.from(
      new Map(users.map((u) => [u.id, u])).values(),
    );
    return uniqueUsers.map((user) => toPublicUser(user));
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
      const existingPost = await this.getPostById(id);

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

      return await this.getPostById(id);
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

  // ===== DELETE =====
  async softDeletePost(id: number, userId: number): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingPost = await this.getPostById(id);

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

      // TODO: Delete post
      // transaction with to delete editor, bookmark, like, hide etc...
      await queryRunner.manager.update(Post, id, { deletedAt: new Date() });
      await queryRunner.manager.delete(Editor, { postId: id });

      await queryRunner.commitTransaction();

      return true;
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

  private cleanOldCacheEntries(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, timestamp] of this.viewCache.entries()) {
      if (timestamp < oneHourAgo) {
        this.viewCache.delete(key);
      }
    }
  }

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

  public transformToPublicPostDto(post: Post): PostCardDto {
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
