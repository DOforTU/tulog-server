import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  PrimaryColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Common } from 'src/common/entity/common.entity';
import { Teammember } from 'src/teammember/teammember.entity';

export enum TeamVisibility {
  ONLY_INVITE = 'ONLY_INVITE',
}

@Entity('team')
@Unique(['teamName'])
@Unique(['leaderId'])
export class Team extends Common {
  @PrimaryColumn()
  teamId: number;

  @Column()
  teamName: string;

  @Column()
  leaderId: number;

  @Column({
    type: 'enum',
    enum: TeamVisibility,
    default: TeamVisibility.ONLY_INVITE,
  })
  visibility: TeamVisibility;

  @Column({ type: 'varchar', nullable: true })
  invitedMember: string;

  @Column({
    type: 'enum',
    enum: ['JOINED', 'INVITED', 'PENDING'],
    default: 'JOINED',
  })
  status: 'JOINED' | 'INVITED' | 'PENDING';

  /** Teammember in Team*/
  @OneToMany(() => Teammember, (teammember) => teammember.team)
  teammember: Teammember[];
}
