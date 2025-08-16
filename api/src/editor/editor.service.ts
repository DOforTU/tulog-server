import { Injectable } from '@nestjs/common';
import { PostCardDto } from 'src/post/post.dto';
import { EditorRepository } from './editor.repository';
import { Post } from 'src/post/post.entity';
import { EditorRole } from './editor.entity';
import { toPublicUser } from 'src/common/helper/to-public-user';

@Injectable()
export class EditorService {
  constructor(private readonly editorRepository: EditorRepository) {}

  /**
   * Get public posts by user ID
   * @param userId
   * @returns
   */
  async getPublicPostsByUserId(userId: number): Promise<PostCardDto[]> {
    const posts = await this.editorRepository.findPublicPostsByUserId(userId);
    if (!posts || posts.length === 0) {
      return [];
    }
    return posts.map((post) => this.transformToPostCardDto(post));
  }

  /**
   * Get team public posts by user ID
   * @param userId
   * @returns
   */
  async getTeamPublicPostsByUserId(userId: number): Promise<PostCardDto[]> {
    const posts =
      await this.editorRepository.findTeamPublicPostsByUserId(userId);
    if (!posts || posts.length === 0) {
      // 이거 왜 둘다 사용하는지 post는 null을 반환안하는데 하나만 사용하면 안되는건가?
      return [];
    }
    return posts.map((post) => this.transformToPostCardDto(post));
  }

  /**
   * Get private posts by user ID
   * @param userId
   * @returns
   */
  async getPrivatePostsByUserId(userId: number): Promise<PostCardDto[]> {
    const posts = await this.editorRepository.findPrivatePostsByUserId(userId);
    if (!posts || posts.length === 0) {
      return [];
    }
    return posts.map((post) => this.transformToPostCardDto(post));
  }

  /**
   * Get team private posts by user ID
   * @param userId
   * @returns
   */
  async getTeamPrivatePostsByUserId(userId: number): Promise<PostCardDto[]> {
    const posts =
      await this.editorRepository.findTeamPrivatePostsByUserId(userId);
    if (!posts || posts.length === 0) {
      return [];
    }
    return posts.map((post) => this.transformToPostCardDto(post));
  }

  /**
   * Get draft posts by user ID
   * @param userId
   * @returns
   */
  async getDraftPostsByUserId(userId: number): Promise<PostCardDto[]> {
    const posts = await this.editorRepository.findDraftPostsByUserId(userId);
    if (!posts || posts.length === 0) {
      return [];
    }
    return posts.map((post) => this.transformToPostCardDto(post));
  }

  /**
   * Transform a post entity to a post card DTO
   * @param post
   * @returns
   */
  private transformToPostCardDto(post: Post): PostCardDto {
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
}
