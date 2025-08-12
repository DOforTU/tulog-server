import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { AdminGuard } from 'src/common/guards/only-admin.guard';

/**
 * User Management Controller
 * - Provides user CRUD APIs
 * - JWT authentication protection
 * - Soft Delete support
 */
@Controller('admin/users')
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  // ===== READ =====

  /** Get all active users */
  @Get('all')
  @UseGuards(AdminGuard)
  async getAllUsers(): Promise<User[] | null> {
    return this.userService.findAllUsers();
  }

  /** Get deleted users list */
  @Get('admin/deleted')
  @UseGuards(AdminGuard)
  async getDeletedUsers(): Promise<User[]> {
    return this.userService.findDeletedUsers();
  }

  /** Get active user count */
  @Get('stats/count')
  @UseGuards(AdminGuard)
  async getCount(): Promise<{ count: number }> {
    const count = await this.userService.getUserCount();
    return { count };
  }

  // ===== UPDATE =====

  /** Restore deleted user */
  @Patch(':id/restore')
  @UseGuards(AdminGuard)
  async restoreUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.restoreUser(id);
  }

  // ===== DELETE =====

  /** Permanently delete user */
  @Delete(':id/hard')
  @UseGuards(AdminGuard)
  async hardDeleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.hardDeleteUser(id);
  }
}
