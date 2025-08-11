import { Team } from 'src/team/team.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * Team Follow Entity
 */
@Entity('team_follow')
export class TeamFollow {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  teamId: number;

  /** Creation timestamp */
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.teamFollows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Team, (team) => team.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
