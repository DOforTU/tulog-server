import { Injectable } from '@nestjs/common';
import { ReportDto } from './report.dto';
import { UserService } from 'src/user/user.service';
import { ReportRepository } from './report.repository';
import { NoticeService } from 'src/notice/notice.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userService: UserService,
    private readonly noticeService: NoticeService,
  ) {}

  async reportUser(
    userId: number,
    reportedUserId: number,
    reportDto: ReportDto,
  ): Promise<boolean> {
    await this.userService.getUserById(userId);

    const reportedUser = await this.userService.getUserById(reportedUserId);
    if (!reportedUser) {
      throw new Error('Reported user not found');
    }

    const admins = await this.userService.getAdmins(userId);
    if (!admins || admins.length === 0) {
      throw new Error('No admins found to notify');
    }

    const message = `유저 ${userId}님이 유저 ${reportedUserId}님을 신고했습니다. 사유: ${reportDto.content}`;
    for (const admin of admins) {
      await this.noticeService.notifyUser(admin.id, message);
    }
    return this.reportRepository.reportUser(userId, reportedUserId, reportDto);
  }
}
