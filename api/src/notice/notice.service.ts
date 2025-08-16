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

  // ===== CREATE =====

  /** Create a new notice */
  async createNotice(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    return await this.noticeRepository.createNotice(createNoticeDto);
  }

  // ===== About user follow info Methods =====
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
    // 기존 팀 초대 알림이 있는지 확인
    const existingNotice = await this.findExistingTeamNotice(
      userId,
      teamId,
      NoticeType.TEAM_INVITE,
    );

    if (existingNotice) {
      // 기존 알림 업데이트
      return await this.updateExistingNotice(
        existingNotice.id,
        `${inviterNickname}님이 '${teamName}' 팀에 초대했습니다.`,
        {
          teamId,
          teamName,
          inviterNickname,
        },
      );
    }

    // 새 알림 생성
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

  /** Create notice for team join
   *  Dto 매핑하기 위함
   */
  async createTeamJoinNotice(
    teamOwnerId: number,
    teamId: number,
    teamName: string,
    newMemberNickname: string,
  ): Promise<Notice> {
    // 기존 팀 가입 요청 알림이 있는지 확인
    const existingNotice = await this.findExistingTeamNotice(
      teamOwnerId,
      teamId,
      NoticeType.TEAM_REQUEST,
    );

    if (existingNotice) {
      // 기존 알림 업데이트
      return await this.updateExistingNotice(
        existingNotice.id,
        `${newMemberNickname}님이 '${teamName}' 팀에 참여 요청을 보냈습니다.`,
        {
          teamId,
          teamName,
          newMemberNickname,
        },
      );
    }

    // 새 알림 생성
    const createNoticeDto: CreateNoticeDto = {
      userId: teamOwnerId,
      type: NoticeType.TEAM_REQUEST,
      title: '새로운 팀원',
      content: `${newMemberNickname}님이 '${teamName}' 팀에 참여 요청을 보냈습니다.`,
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
      title: '팀에서 강퇴',
      content: `'${teamName}' 팀에서 강퇴되었습니다.`,
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

  // ===== READ =====

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

  // ===== UPDATE =====

  /** Mark notice as read */
  async markAsRead(noticeId: number, userId: number): Promise<Notice> {
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

  // ===== DELETE =====

  // 알림이 존재한지 체크
  // 있으면 유저아이디랑 알림아이디를 받아서 알림테이블에서 지워주면 삭제완료

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

  /** Delete team-related notices when invitation/join request is accepted or rejected
   *  팀에 속해있는 유저는 팀관련 소식을 제거할 수 있다
   *  팀 소속 유저여야함 --> 그 유저는 자신의 페이지에서 소식 삭제 가능
   *  다른 유저는 삭제가 안됨 물론 그 유저는 삭제 안했으니까
   */
  async deleteTeamNoticesByTeamAndUser(
    userId: number,
    teamId: number,
    type: NoticeType,
  ): Promise<void> {
    try {
      await this.dataSource
        .getRepository(Notice)
        .createQueryBuilder()
        .delete()
        .from(Notice)
        .where('userId = :userId', { userId }) // 내가 id =1 이고
        .andWhere('relatedEntityId = :teamId', { teamId }) // 팀 1에 소속됨
        .andWhere('type = :type', { type }) // 소식인 것을 삭제함
        .execute();
    } catch (error) {
      console.error('Failed to delete team notices:', error);
      // 알림 삭제 실패는 중요한 기능에 영향을 주지 않도록 에러를 던지지 않음
    }
  }

  /** Cleanup old notices (for scheduled job)
   *  오래된 알림 삭제
   *
   */
  async cleanupOldNotices(
    daysOld: number = 30,
  ): Promise<{ deletedCount: number }> {
    const deletedCount = await this.noticeRepository.deleteOldNotices(daysOld);
    return { deletedCount };
  }

  // ===== HELPER METHODS =====

  /** Find existing team notice by userId, teamId, and type */
  private async findExistingTeamNotice(
    userId: number,
    teamId: number,
    type: NoticeType,
  ): Promise<Notice | null> {
    return await this.dataSource
      .getRepository(Notice)
      .createQueryBuilder('notice')
      .where('notice.userId = :userId', { userId })
      .andWhere('notice.type = :type', { type })
      .andWhere('notice.relatedEntityId = :teamId', { teamId })
      .getOne();
  }

  /** Update existing notice with new content and reset read status */
  private async updateExistingNotice(
    noticeId: number,
    newContent: string,
    newMetadata: any,
  ): Promise<Notice> {
    await this.dataSource.getRepository(Notice).update(noticeId, {
      content: newContent,
      metadata: newMetadata,
      isRead: false,
      updatedAt: new Date(),
    });

    const notice = await this.dataSource
      .getRepository(Notice)
      .findOne({ where: { id: noticeId } });

    if (!notice) {
      throw new NotFoundException(`Notice with id ${noticeId} not found`);
    }

    return notice;
  }
}
