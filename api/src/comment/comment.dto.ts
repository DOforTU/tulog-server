import { ArrayMaxSize, IsArray, IsOptional, IsString } from 'class-validator';

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
