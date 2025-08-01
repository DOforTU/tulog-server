import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UserBlockService } from './user-block.service';
import { User } from 'src/user/user.entity';
import { UserBlock } from './user-block.entity';

@Controller('users')
export class UserBlockController {
  constructor(private readonly userBlockService: UserBlockService) {}

  /**req.user.id는 로그인한 유저이고 id는 내가 차단할 사용자의 id */
  @Post(':id/block')
  @UseGuards(JwtAuthGuard)
  async blockUser(
    @Request() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserBlock> {
    return await this.userBlockService.blockUser(req.user.id, id);
  }

  /** Get my blockmember */
  @Get('users/me/blocks')
  @UseGuards(JwtAuthGuard)
  async getMyBlockUsers(
    @Request() req: { user: User },
  ): Promise<User[] | null> {
    return await this.userBlockService.getBlockUsers(req.user.id);
  }

  @Delete('users/:id/block')
  @UseGuards(JwtAuthGuard)
  async unblockUser(
    @Request() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return await this.userBlockService.unblockUser(req.user.id, id);
  }
}
