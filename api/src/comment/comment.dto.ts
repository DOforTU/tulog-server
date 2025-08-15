import { ArrayMaxSize, IsArray, IsOptional, IsString } from 'class-validator';
import { PublicUser } from 'src/user/user.dto';

export class CreateCommentDto {
  @IsString()
  comment: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCommentDto {
  @IsString()
  comment: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];
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
