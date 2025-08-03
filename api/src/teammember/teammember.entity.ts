import { Team } from 'src/team/team.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
  OneToMany,
  Column,
} from 'typeorm';

export enum TeamRole {
  Leader = 'leader',
  Member = 'member',
  // 다른 역할 추가 가능
}

/**
 * Teammember Entity
 */
@Entity('teammember')
export class Teammember {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  teamId: number;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.Member,
  })
  role: TeamRole;

  /** Creation timestamp */
  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['JOINED'],
    default: 'JOINED',
  })
  status: 'JOINED';

  @ManyToOne(() => User, (user) => user.teammembers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
