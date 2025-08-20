import { Injectable } from '@nestjs/common';
import { ReportDto } from './report.dto';
import { UserService } from 'src/user/user.service';
import { ReportRepository } from './report.repository';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userService: UserService,
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
    return this.reportRepository.reportUser(userId, reportedUserId, reportDto);
  }
}
