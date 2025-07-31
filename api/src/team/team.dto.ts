import { IsString, IsEnum, IsOptional } from 'class-validator';
import { TeamVisibility } from './team.entity';

export class CreateTeamDto {
  //@IsString()
  //teamId: string;

  @IsString()
  teamName: string;

  @IsString()
  leaderId: string;

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
