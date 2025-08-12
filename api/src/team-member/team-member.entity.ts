import { Team } from 'src/team/team.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';

export enum TeamMemberStatus {
  JOINED = 'JOINED',
  INVITED = 'INVITED',
  PENDING = 'PENDING',
}

/**
 * Teammember Entity
 */
@Entity('team_member')
export class TeamMember {
  @PrimaryColumn()
  memberId: number;

  @PrimaryColumn()
  teamId: number;

  @Column({ default: false })
  isLeader: boolean;

  /** Creation timestamp */
  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: TeamMemberStatus,
    default: TeamMemberStatus.JOINED,
  })
  status: TeamMemberStatus;

  @ManyToOne(() => User, (user) => user.teamMembers)
  @JoinColumn({ name: 'memberId' })
  user: User;

  @ManyToOne(() => Team, (team) => team.teamMembers)
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
