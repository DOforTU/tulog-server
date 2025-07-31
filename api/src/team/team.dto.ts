import { IsString, IsEnum, IsOptional } from 'class-validator';
import { TeamVisibility } from './team.entity';

export class CreateTeamDto {
  @IsString()
  teamId: string;

  @IsString()
  teamName: string;

  @IsString()
  leaderId: string;

  @IsEnum(TeamVisibility)
  visibility: TeamVisibility;

  @IsOptional()
  @IsString()
  invitedMember?: string;
}

export class ReportTeamDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
