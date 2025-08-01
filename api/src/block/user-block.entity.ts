import { User } from 'src/user/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('userBlock')
export class UserBlock {
  @PrimaryColumn()
  blockerId: number;

  @PrimaryColumn()
  blockedId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.blockers)
  @JoinColumn({ name: 'blockerId' })
  blocker: User;

  @ManyToOne(() => User, (user) => user.blocked)
  @JoinColumn({ name: 'blockedId' })
  blocked: User;
}
