import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt';
import { ReportDto } from './report.dto';
import { ReportService } from './report.service';
import { User } from 'src/user/user.entity';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  async reportUser(
    @Request() req: { user: User },
    @Param('userId') userId: number,
    @Body() reportDto: ReportDto,
  ): Promise<boolean> {
    return this.reportService.reportUser(req.user.id, userId, reportDto);
  }
}
