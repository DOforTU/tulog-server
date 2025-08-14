import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';
import { PostStatus } from './post.entity';
import { PublicUser } from 'src/user/user.dto';

export class PostCardDto {
  id: number;
  title: string;
  excerpt: string;
  thumbnailImage: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  teamId?: number;
  teamName?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  authors: PublicUser[];
}

export class CreatePostDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  teamId?: number;
}

export class DraftPostDto extends CreatePostDto {}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  teamId?: number;
}
