import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

/**
 * Common Entity
 */
export class Common {
  // @Column({ default: false })
  // isDeleted: boolean;

  /** Creation timestamp */
  @CreateDateColumn()
  createdAt: Date;

  /** Update timestamp */
  @UpdateDateColumn()
  updatedAt: Date;

  /** Deletion timestamp (set when soft deleted) */
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
