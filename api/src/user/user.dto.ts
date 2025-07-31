import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

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
  profilePicture?: string;

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
  @MinLength(8)
  @MaxLength(20)
  @Matches(/(?=.*[A-Z])/, {
    message: 'Must contain at least 1 uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Must contain at least 1 lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Must contain at least 1 number',
  })
  @Matches(/(?=.*[!@#$%^&*()\-_=+{}[\]|\\:;"'<>,.?/`~])/, {
    message: 'Must contain at least 1 special character',
  })
  @Matches(/^[^\s]+$/, {
    message: 'Password must not contain spaces',
  })
  @IsString()
  newPassword: string;
}
