import { IsString, IsEnum } from 'class-validator';
import { AuthProvider } from './auth.entity';

/**
 * User creation DTO
 * - Used when creating new user accounts
 * - Email and username are required, others are optional
 */
export class CreateAuthDto {
  @IsString()
  oauthId: string;

  @IsEnum(AuthProvider)
  provider: AuthProvider;
}
