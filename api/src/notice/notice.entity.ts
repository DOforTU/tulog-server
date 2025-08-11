import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/user.entity';

export enum NoticeType {
  FOLLOW = 'follow',
  TEAM_INVITE = 'team_invite',
  TEAM_JOIN = 'team_join',
  TEAM_LEAVE = 'team_leave',
  TEAM_KICK = 'team_kick',
  SYSTEM = 'system',
}

/**
 * Notice Entity
 * - User notification system
 * - One-to-Many relationship with User (one user can have many notices)
 * - Supports different types of notifications
 * - Read/Unread status tracking
 */
@Entity('notice')
@Index(['userId', 'createdAt']) // For efficient user notice queries with sorting
@Index(['userId', 'isRead']) // For filtering read/unread notices
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  /** Notice type (follow, team_invite, etc.) */
  @Column({
    type: 'enum',
    enum: NoticeType,
    default: NoticeType.SYSTEM,
  })
  type: NoticeType;

  /** Notice title */
  @Column({ length: 255 })
  title: string;

  /** Notice content/message */
  @Column({ type: 'text' })
  content: string;

  /** Is the notice read by user */
  @Column({ default: false })
  isRead: boolean;

  /** Related entity ID (optional, for referencing team, post, etc.) */
  @Column({ nullable: true })
  relatedEntityId: number;

  /** Additional metadata as JSON */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /** User who receives this notice */
  @Column()
  userId: number;

  /** User relationship */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** Notice creation timestamp */
  @CreateDateColumn()
  createdAt: Date;

  /** Notice update timestamp */
  @UpdateDateColumn()
  updatedAt: Date;
}
