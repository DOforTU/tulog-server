import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { Team, TeamVisibility } from './team.entity';
import { ResponsePublicUser } from 'src/user/user.dto';

export class CreateTeamDto {
  /** Tema Name (required) */
  @MinLength(4)
  @MaxLength(20)
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  introduction: string;

  @IsOptional()
  @IsEnum(TeamVisibility)
  visibility?: TeamVisibility;

  @IsOptional()
  @IsNumber()
  @Max(10)
  @Min(1)
  maxMember: number;

  @IsString()
  @IsOptional()
  mainImage: string;
}

export class UpdateTeamInfoDto {
  @IsOptional()
  @MinLength(4)
  @MaxLength(20)
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  introduction: string;

  @IsOptional()
  @IsEnum(TeamVisibility)
  visibility?: TeamVisibility;

  @IsOptional()
  @IsNumber()
  @Max(10)
  @Min(1)
  maxMember?: number;
}

export class PublicTeamMember {
  memberId: number;
  teamId: number;
  isLeader: boolean;
  createdAt: Date;
  team: Team;
  user: ResponsePublicUser; // 공개용 유저 타입
}

export class PublicTeam {
  id: number;
  name: string;
  introduction: string;
  mainImage: string;
  maxMember: number;
  visibility: TeamVisibility;
  teamMembers: PublicTeamMember[];
}

// DTO for reporting a team
export class ReportTeamDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}

// DTO for changing team visibility
export class ChangeVisibilityDto {
  @IsEnum(TeamVisibility)
  visibility: TeamVisibility;
}
