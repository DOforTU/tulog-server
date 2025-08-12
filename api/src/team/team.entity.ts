import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Common } from 'src/common/entity/common.entity';
import { TeamMember } from 'src/team-member/team-member.entity';
import { Max, Min } from 'class-validator';
import { TeamFollow } from 'src/team-follow/team-follow.entity';

export enum TeamVisibility {
  ONLY_INVITE = 'ONLY_INVITE',
  INVITE_AND_REQUEST = 'INVITE_AND_REQUEST',
}

@Entity('team')
export class Team extends Common {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  introduction: string;

  @Column({ default: 10 })
  @Max(10)
  @Min(1)
  maxMember: number;

  @Column({
    type: 'enum',
    enum: TeamVisibility,
    default: TeamVisibility.ONLY_INVITE,
  })
  visibility: TeamVisibility;

  @Column()
  mainImage: string;

  /** Teammember in Team*/
  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  teamMembers: TeamMember[];

  @OneToMany(() => TeamFollow, (teamFollow) => teamFollow.team)
  followers: TeamFollow[];
}
