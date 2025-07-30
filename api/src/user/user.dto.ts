import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

/**
 * User creation DTO
 * - Used when creating new user accounts
 * - Email and username are required, others are optional
 */
export class CreateUserDto {
  /** User email (required, valid email format) */
  @IsEmail()
  email: string;

  /** Name (required) */
  @IsString()
  name: string;

  /** Password (optional, not required for Google OAuth) */
  @IsOptional()
  @IsString()
  password?: string;

  /** User nickname */
  @IsOptional()
  @IsString()
  nickname: string;

  /** Profile picture URL (default: default-avatar.png) */
  @IsOptional()
  @IsString()
  profilePicture: string;

  /** Account activation status (optional, default: false) */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * User update DTO
 * - Used when updating existing user information
 * - All fields are optional
 */
export class UpdateUserDto {
  /** Username (optional) */
  @IsOptional()
  @IsString()
  name?: string;

  /** Password (optional) */
  @IsOptional()
  @IsString()
  password?: string;

  /** User nickname (optional) */
  @IsOptional()
  @IsString()
  nickname?: string;

  /** Profile picture URL (optional) */
  @IsOptional()
  @IsString()
  profilePicture?: string;
}

// TODO: Add user search DTO
// TODO: Add password change DTO
// TODO: Add profile image upload DTO
// TODO: Add user settings DTO
// TODO: Add email verification DTO
