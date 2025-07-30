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

  /** User nickname (optional) */
  @IsOptional()
  @IsString()
  nickname?: string;

  /** Profile picture URL (optional) */
  @IsOptional()
  @IsString()
  profilePicture?: string;
}

/**
 * User password update DTO
 * - Used when updating user password
 */
export class UpdatePasswordDto {
  /** Password (required) */
  @IsString()
  oldPassword: string;

  /** Password (required) */
  @IsString()
  newPassword: string;
}
