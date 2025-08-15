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
}
