import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportDto } from './report.dto';
import { Report } from './report.entity';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async reportUser(
    userId: number,
    reportedUserId: number,
    reportDto: ReportDto,
  ): Promise<boolean> {
    const report = this.reportRepository.create({
      reporter: { id: userId }, // userId 대신 관계필드 reporter에 id가 있는 옵셔널 객체를 넣음
      reportedUser: { id: reportedUserId },
      content: reportDto.content,
    });

    await this.reportRepository.save(report);
    return true;
  }
}
