import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { TeamVisibility } from './team.entity';

export class CreateTeamDto {
  //@IsString()
  //teamId: string;

  /** Tema Name (required) */
  @MinLength(5)
  @MaxLength(20)
  @Matches(/(?=.*[A-Z\uac00-\ud7af])/, {
    message: 'Must contain at least 5 letter',
  })
  @IsString()
  teamName: string;

  @IsString()
  introduction: string;

  @IsEnum(TeamVisibility)
  visibility: TeamVisibility;

  @IsOptional()
  @IsString()
  invitedMember?: string[];
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
