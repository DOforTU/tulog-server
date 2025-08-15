import { ArrayMaxSize, IsArray, IsOptional, IsString } from 'class-validator';
import { IsString } from 'class-validator';
import { PublicUser } from 'src/user/user.dto';

export class CreateCommentDto {
  @IsString()
  content: string;
}

export class UpdateCommentDto {
  @IsString()
  content: string;
}

export class CommentWithAuthor {
  id: number;
  content: string;
  postId: number;
  author: PublicUser;
  createdAt: Date;
  replies?: CommentWithAuthor[];
}

export class CommentWithAuthor {
  id: number;
  content: string;
  postId: number;
  author: PublicUser;
  createdAt: Date;
  replies?: CommentWithAuthor[];
}

export class CommentWithLike {
  id: number;
  content: string;
  postId: number;
  author: PublicUser;
  createdAt: Date;
  replies?: CommentWithAuthor[];
  likeCount: number;
}
