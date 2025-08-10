import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { NoticeType } from './notice.entity';

/**
 * Notice creation DTO
 * - Used when creating new notices
 * - Most fields are required except related entity info
 */
export class CreateNoticeDto {
  /** Notice type */
  @IsEnum(NoticeType)
  type: NoticeType;

  /** Notice title */
  @IsString()
  @MaxLength(255)
  title: string;

  /** Notice content */
  @IsString()
  content: string;

  /** User ID who receives the notice */
  @IsNumber()
  userId: number;

  /** Related entity ID (optional) */
  @IsOptional()
  @IsNumber()
  relatedEntityId?: number;

  /** Additional metadata (optional) */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Notice update DTO
 * - Used when updating notice information
 * - Typically only isRead status is updated
 */
export class UpdateNoticeDto {
  /** Read status (main use case for updates) */
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  /** Notice title (optional update) */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  /** Notice content (optional update) */
  @IsOptional()
  @IsString()
  content?: string;
}

/**
 * Notice query DTO
 * - Used for filtering and pagination
 */
export class QueryNoticeDto {
  /** Filter by read status */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRead?: boolean;

  /** Filter by notice type */
  @IsOptional()
  @IsEnum(NoticeType)
  type?: NoticeType;

  /** Pagination: page number */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  /** Pagination: items per page */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
