import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { AuthProvider } from './user.entity';

/**
 * 사용자 생성 DTO
 * - 새 사용자 계정 생성 시 사용
 * - 이메일과 사용자명은 필수, 나머지는 선택
 */
export class CreateUserDto {
  /** 사용자 이메일 (필수, 유효한 이메일 형식) */
  @IsEmail()
  email: string;

  /** 사용자명 (필수) */
  @IsString()
  username: string;

  /** 비밀번호 (선택, Google OAuth 시 불필요) */
  @IsOptional()
  @IsString()
  password?: string;

  /** 사용자 닉네임 (선택) */
  @IsOptional()
  @IsString()
  nickname?: string;

  /** Google OAuth ID (선택) */
  @IsOptional()
  @IsString()
  googleId?: string;

  /** 프로필 사진 URL (선택) */
  @IsOptional()
  @IsString()
  profilePicture?: string;

  /** 로그인 제공자 (선택, 기본값: 'google') */
  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider;

  /** 계정 활성화 상태 (선택, 기본값: true) */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * 사용자 업데이트 DTO
 * - 기존 사용자 정보 수정 시 사용
 * - 모든 필드가 선택적
 */
export class UpdateUserDto {
  /** 사용자 이메일 (선택, 유효한 이메일 형식) */
  @IsOptional()
  @IsEmail()
  email?: string;

  /** 사용자명 (선택) */
  @IsOptional()
  @IsString()
  username?: string;

  /** 비밀번호 (선택) */
  @IsOptional()
  @IsString()
  password?: string;

  /** 사용자 닉네임 (선택) */
  @IsOptional()
  @IsString()
  nickname?: string;

  /** Google OAuth ID (선택) */
  @IsOptional()
  @IsString()
  googleId?: string;

  /** 프로필 사진 URL (선택) */
  @IsOptional()
  @IsString()
  profilePicture?: string;

  /** 로그인 제공자 (선택) */
  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider;

  /** 계정 활성화 상태 (선택) */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// TODO: 사용자 검색 DTO 추가
// TODO: 비밀번호 변경 DTO 추가
// TODO: 프로필 이미지 업로드 DTO 추가
// TODO: 사용자 설정 DTO 추가
// TODO: 이메일 인증 DTO 추가
