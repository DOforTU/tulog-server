import { Team } from 'src/team/team.entity';
import { TeamMemberStatus } from './team-member.entity';

export class TeamWithStatus {
  team: Team;
  status: TeamMemberStatus;
}
