import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Notice, NoticeType } from './notice.entity';
import { CreateNoticeDto } from './notice.dto';

@Injectable()
export class NoticeRepository {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
  ) {}

  /** Create a new notice */
  async createNotice(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const notice = this.noticeRepository.create(createNoticeDto);
    return await this.noticeRepository.save(notice);
  }

  /** Create a notice with transaction */
  async createNoticeWithTransaction(
    createNoticeDto: CreateNoticeDto,
    manager: EntityManager,
  ): Promise<Notice> {
    const notice = manager.getRepository(Notice).create(createNoticeDto);
    return await manager.getRepository(Notice).save(notice);
  }

  /** Find notices by user ID with pagination */
  async findByUserId(
    userId: number,
    page: number = 1,
    limit: number = 20,
    isRead?: boolean,
    type?: NoticeType,
  ): Promise<{ notices: Notice[]; total: number }> {
    const queryBuilder = this.noticeRepository
      .createQueryBuilder('notice')
      .where('notice.userId = :userId', { userId })
      .orderBy('notice.createdAt', 'DESC');

    // Apply filters
    if (isRead !== undefined) {
      queryBuilder.andWhere('notice.isRead = :isRead', { isRead });
    }

    if (type) {
      queryBuilder.andWhere('notice.type = :type', { type });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [notices, total] = await queryBuilder.getManyAndCount();

    return { notices, total };
  }

  /** Find notice by ID and user ID (for ownership check) */
  async findByIdAndUserId(id: number, userId: number): Promise<Notice | null> {
    return await this.noticeRepository.findOne({
      where: { id, userId },
    });
  }

  /** Mark notice as read */
  async markAsRead(id: number, userId: number): Promise<boolean> {
    const result = await this.noticeRepository.update(
      { id, userId },
      { isRead: true },
    );
    return (result.affected || 0) > 0;
  }

  /** Mark all notices as read for a user */
  async markAllAsRead(userId: number): Promise<number> {
    const result = await this.noticeRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return result.affected || 0;
  }

  /** Get unread notice count for a user */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.noticeRepository.count({
      where: { userId, isRead: false },
    });
  }

  /** Delete notice by ID and user ID */
  async deleteByIdAndUserId(id: number, userId: number): Promise<boolean> {
    const result = await this.noticeRepository.delete({ id, userId });
    return (result.affected || 0) > 0;
  }

  /** Delete old notices (cleanup job) */
  async deleteOldNotices(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.noticeRepository.delete({
      createdAt: { $lt: cutoffDate } as any,
    });

    return result.affected || 0;
  }

  /** Find notices by type and related entity */
  async findByTypeAndRelatedEntity(
    type: NoticeType,
    relatedEntityId: number,
  ): Promise<Notice[]> {
    return await this.noticeRepository.find({
      where: {
        type,
        relatedEntityId,
      },
    });
  }
}
