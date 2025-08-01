import {
  Controller,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { SmartAuthGuard } from 'src/auth/jwt';

/**
 * User Management Controller
 * - Provides user CRUD APIs
 * - JWT authentication protection
 * - Soft Delete support
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ===== Basic CRUD - REST API =====
  /** Get current logged-in user information */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Request() req: { user: User }): User {
    return req.user;
  }

  /** Get user by ID */
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  /** Get user by id or nickname (query) */
  @Get()
  async getUserByIdOrNickname(
    @Query('id') id?: string,
    @Query('nickname') nickname?: string,
  ): Promise<User | null> {
    if (id) {
      const idNum = Number(id);
      if (!isNaN(idNum)) {
        return this.userService.getUserById(idNum);
      }
    }
    if (nickname) {
      return this.userService.getUserByNickname(nickname);
    }
    return null;
  }

  /** Update user information(only active users) */
  @Patch('me')
  @UseGuards(SmartAuthGuard)
  async updateUser(
    @Request() req: { user: User },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  /** Soft delete user */
  @Patch('me/delete')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Request() req: { user: User }): Promise<boolean> {
    return this.userService.deleteUser(req.user.id);
  }

  // ===== Special Query APIs =====

  /** Get user by nickname */
  @Get('nickname/:nickname')
  async getUserByNickname(
    @Param('nickname') nickname: string,
  ): Promise<User | null> {
    return this.userService.getUserByNickname(nickname);
  }

  /** Get deleted users list */
  @Get('deleted')
  async getDeletedUsers(): Promise<User[]> {
    return this.userService.getDeletedUsers();
  }

  /** Get active user count */
  @Get('count')
  async getCount(): Promise<{ count: number }> {
    const count = await this.userService.getUserCount();
    return { count };
  }

  // ===== Admin Only APIs =====

  /** Get all active users */
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  /** Permanently delete user */
  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard)
  async hardDeleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.hardDeleteUser(id);
  }

  /** Restore deleted user */
  @Patch(':id/restore')
  async restoreUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.restoreUser(id);
  }
}
