import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NoticeRepository } from './notice.repository';
import { CreateNoticeDto, QueryNoticeDto } from './notice.dto';
import { Notice, NoticeType } from './notice.entity';

@Injectable()
export class NoticeService {
  constructor(
    private readonly noticeRepository: NoticeRepository,
    private readonly dataSource: DataSource,
  ) {}

  /** Create a new notice */
  async createNotice(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    return await this.noticeRepository.createNotice(createNoticeDto);
  }

  /** Create notice for user follow event */
  async createFollowNotice(
    targetUserId: number,
    followerUserId: number,
    followerNickname: string,
  ): Promise<Notice> {
    const createNoticeDto: CreateNoticeDto = {
      userId: targetUserId,
      type: NoticeType.FOLLOW,
      title: '새로운 팔로워',
      content: `${followerNickname}님이 회원님을 팔로우하기 시작했습니다.`,
      relatedEntityId: followerUserId,
      metadata: {
        followerUserId,
        followerNickname,
      },
    };

    return await this.noticeRepository.createNotice(createNoticeDto);
  }

  /** Create notice for team invite */
  async createTeamInviteNotice(
    userId: number,
    teamId: number,
    teamName: string,
    inviterNickname: string,
  ): Promise<Notice> {
    const createNoticeDto: CreateNoticeDto = {
      userId,
      type: NoticeType.TEAM_INVITE,
      title: '팀 초대',
      content: `${inviterNickname}님이 '${teamName}' 팀에 초대했습니다.`,
      relatedEntityId: teamId,
      metadata: {
        teamId,
        teamName,
        inviterNickname,
      },
    };

    return await this.noticeRepository.createNotice(createNoticeDto);
  }

  /** Create notice for team join */
  async createTeamJoinNotice(
    teamOwnerId: number,
    teamId: number,
    teamName: string,
    newMemberNickname: string,
  ): Promise<Notice> {
    const createNoticeDto: CreateNoticeDto = {
      userId: teamOwnerId,
      type: NoticeType.TEAM_JOIN,
      title: '새로운 팀원',
      content: `${newMemberNickname}님이 '${teamName}' 팀에 가입했습니다.`,
      relatedEntityId: teamId,
      metadata: {
        teamId,
        teamName,
        newMemberNickname,
      },
    };

    return await this.noticeRepository.createNotice(createNoticeDto);
  }

  /** Create notice for team leave */
  async createTeamLeaveNotice(
    teamOwnerId: number,
    teamId: number,
    teamName: string,
    leftMemberNickname: string,
  ): Promise<Notice> {
    const createNoticeDto: CreateNoticeDto = {
      userId: teamOwnerId,
      type: NoticeType.TEAM_LEAVE,
      title: '팀원 탈퇴',
      content: `${leftMemberNickname}님이 '${teamName}' 팀을 탈퇴했습니다.`,
      relatedEntityId: teamId,
      metadata: {
        teamId,
        teamName,
        leftMemberNickname,
      },
    };

    return await this.noticeRepository.createNotice(createNoticeDto);
  }

  /** Create notice for team kick */
  async createTeamKickNotice(
    kickedUserId: number,
    teamId: number,
    teamName: string,
    kickerNickname: string,
  ): Promise<Notice> {
    const createNoticeDto: CreateNoticeDto = {
      userId: kickedUserId,
      type: NoticeType.TEAM_KICK,
      title: '팀에서 제명',
      content: `'${teamName}' 팀에서 제명되었습니다.`,
      relatedEntityId: teamId,
      metadata: {
        teamId,
        teamName,
        kickerNickname,
      },
    };

    return await this.noticeRepository.createNotice(createNoticeDto);
  }

  /** Create system notice */
  async createSystemNotice(
    userId: number,
    title: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<Notice> {
    const createNoticeDto: CreateNoticeDto = {
      userId,
      type: NoticeType.SYSTEM,
      title,
      content,
      metadata,
    };

    return await this.noticeRepository.createNotice(createNoticeDto);
  }

  /** Get user notices with pagination and filters */
  async getUserNotices(
    userId: number,
    queryDto: QueryNoticeDto,
  ): Promise<{
    notices: Notice[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
  }> {
    const { page = 1, limit = 20, isRead, type } = queryDto;

    const result = await this.noticeRepository.findByUserId(
      userId,
      page,
      limit,
      isRead,
      type,
    );

    const hasNext = page * limit < result.total;

    return {
      notices: result.notices,
      total: result.total,
      page,
      limit,
      hasNext,
    };
  }

  /** Get unread notice count */
  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.noticeRepository.getUnreadCount(userId);
    return { count };
  }

  /** Mark notice as read */
  async markAsRead(userId: number, noticeId: number): Promise<Notice> {
    // Verify ownership
    const notice = await this.noticeRepository.findByIdAndUserId(
      noticeId,
      userId,
    );

    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    if (notice.isRead) {
      return notice; // Already read
    }

    const success = await this.noticeRepository.markAsRead(noticeId, userId);
    if (!success) {
      throw new NotFoundException('Failed to mark notice as read');
    }

    return { ...notice, isRead: true };
  }

  /** Mark all notices as read */
  async markAllAsRead(userId: number): Promise<{ updatedCount: number }> {
    const updatedCount = await this.noticeRepository.markAllAsRead(userId);
    return { updatedCount };
  }

  /** Delete notice */
  async deleteNotice(userId: number, noticeId: number): Promise<void> {
    const notice = await this.noticeRepository.findByIdAndUserId(
      noticeId,
      userId,
    );

    if (!notice) {
      throw new NotFoundException('Notice not found');
    }

    const success = await this.noticeRepository.deleteByIdAndUserId(
      noticeId,
      userId,
    );

    if (!success) {
      throw new NotFoundException('Failed to delete notice');
    }
  }

  /** Cleanup old notices (for scheduled job) */
  async cleanupOldNotices(
    daysOld: number = 30,
  ): Promise<{ deletedCount: number }> {
    const deletedCount = await this.noticeRepository.deleteOldNotices(daysOld);
    return { deletedCount };
  }

  /** Create multiple notices with transaction (for bulk operations) */
  async createMultipleNotices(
    createNoticeDtos: CreateNoticeDto[],
  ): Promise<Notice[]> {
    return await this.dataSource.transaction(async (manager) => {
      const notices: Notice[] = [];

      for (const createNoticeDto of createNoticeDtos) {
        const notice = await this.noticeRepository.createNoticeWithTransaction(
          createNoticeDto,
          manager,
        );
        notices.push(notice);
      }

      return notices;
    });
  }
}
