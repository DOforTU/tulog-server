import {
  Controller,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

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

  /** Get user by ID */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  /** Update user information */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  /** Soft delete user */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }

  // ===== Special Query APIs =====

  /** Get current logged-in user information */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Request() req: { user: User }): User {
    return req.user;
  }

  /** Get deleted users list */
  @Get('deleted')
  async findDeleted(): Promise<User[]> {
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
  async findAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  /** Permanently delete user */
  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard)
  async hardDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.hardDeleteUser(id);
  }

  /** Restore deleted user */
  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.restoreUser(id);
  }
}

// TODO: Add user search API (search by name, email, nickname)
// TODO: Add pagination API
// TODO: Add user profile image upload API
// TODO: Add social account linking/unlinking API
// TODO: Add account activation/deactivation API
// TODO: Add admin permission check middleware
// TODO: Add user statistics dashboard API
