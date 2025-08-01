import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  PrimaryColumn,
} from 'typeorm';
import { Common } from 'src/common/entity/common.entity';

export enum TeamVisibility {
  ONLY_INVITE = 'ONLY_INVITE',
}

@Entity('team')
@Unique(['teamName'])
@Unique(['leaderId'])
export class Team extends Common {
  @PrimaryColumn()
  teamId: string;

  @Column()
  teamName: string;

  @Column()
  leaderId: string;

  @Column({
    type: 'enum',
    enum: TeamVisibility,
    default: TeamVisibility.ONLY_INVITE,
  })
  visibility: TeamVisibility;

  @Column({ type: 'varchar', nullable: true })
  invitedMember: string;
}
