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
import { TeamVisibility } from './team.entity';

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
