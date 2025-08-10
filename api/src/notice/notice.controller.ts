import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, QueryNoticeDto } from './notice.dto';
import { Notice } from './notice.entity';

@Controller('notices')
@UseGuards(JwtAuthGuard)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  /**
   * Create a new notice
   * POST /notices
   * Admin/System use only
   */
  @Post()
  async createNotice(@Body() createNoticeDto: CreateNoticeDto): Promise<{
    status: number;
    message: string;
    data: Notice;
  }> {
    const notice = await this.noticeService.createNotice(createNoticeDto);

    return {
      status: HttpStatus.CREATED,
      message: 'Notice created successfully',
      data: notice,
    };
  }

  /**
   * Get user's notices with pagination and filters
   * GET /notices
   */
  @Get()
  async getUserNotices(
    @Request() req: any,
    @Query() queryDto: QueryNoticeDto,
  ): Promise<{
    status: number;
    message: string;
    data: {
      notices: Notice[];
      total: number;
      page: number;
      limit: number;
      hasNext: boolean;
    };
  }> {
    const userId = req.user.userId;
    const result = await this.noticeService.getUserNotices(userId, queryDto);

    return {
      status: HttpStatus.OK,
      message: 'Notices retrieved successfully',
      data: result,
    };
  }

  /**
   * Get unread notice count
   * GET /notices/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req: any): Promise<{
    status: number;
    message: string;
    data: { count: number };
  }> {
    const userId = req.user.userId;
    const result = await this.noticeService.getUnreadCount(userId);

    return {
      status: HttpStatus.OK,
      message: 'Unread count retrieved successfully',
      data: result,
    };
  }

  /**
   * Mark notice as read
   * PATCH /notices/:id/read
   */
  @Patch(':id/read')
  async markAsRead(
    @Request() req: any,
    @Param('id', ParseIntPipe) noticeId: number,
  ): Promise<{
    status: number;
    message: string;
    data: Notice;
  }> {
    const userId = req.user.userId;
    const notice = await this.noticeService.markAsRead(userId, noticeId);

    return {
      status: HttpStatus.OK,
      message: 'Notice marked as read',
      data: notice,
    };
  }

  /**
   * Mark all notices as read
   * PATCH /notices/read-all
   */
  @Patch('read-all')
  async markAllAsRead(@Request() req: any): Promise<{
    status: number;
    message: string;
    data: { updatedCount: number };
  }> {
    const userId = req.user.userId;
    const result = await this.noticeService.markAllAsRead(userId);

    return {
      status: HttpStatus.OK,
      message: 'All notices marked as read',
      data: result,
    };
  }

  /**
   * Delete notice
   * DELETE /notices/:id
   */
  @Delete(':id')
  async deleteNotice(
    @Request() req: any,
    @Param('id', ParseIntPipe) noticeId: number,
  ): Promise<{
    status: number;
    message: string;
  }> {
    const userId = req.user.userId;
    await this.noticeService.deleteNotice(userId, noticeId);

    return {
      status: HttpStatus.OK,
      message: 'Notice deleted successfully',
    };
  }
}
