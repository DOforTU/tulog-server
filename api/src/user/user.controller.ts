import {
  Controller,
  Get,
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
import { PublicUser, UserDetails, UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { SmartAuthGuard } from 'src/auth/jwt';
import { toPublicUser } from 'src/common/helper/to-public-user';

/**
 * User Management Controller
 * - Provides user CRUD APIs
 * - JWT authentication protection
 * - Soft Delete support
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ===== READ =====

  /** Get current logged-in user information */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Request() req: { user: User }): User {
    return req.user;
  }

  /** Get user by ID */
  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicUser> {
    return toPublicUser(await this.userService.getUserById(id));
  }

  /** Get user by nickname */
  @Get('nickname/:nickname')
  async getUserByNickname(
    @Param('nickname') nickname: string,
  ): Promise<PublicUser> {
    return toPublicUser(await this.userService.getUserByNickname(nickname));
  }

  /**
   * Get user details including teams, followers, and following
   * @param id User ID: the ID of the user whose details are to be fetched
   * @returns UserDetails object with teams, followers, and following arrays (empty arrays if no data)
   */
  @Get(':id/details')
  async getUserDetailsById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserDetails> {
    return await this.userService.getUserDetailsById(id);
  }

  @Get('nickname/:nickname/details')
  async getUserDetailsByNickname(
    @Param('nickname') nickname: string,
  ): Promise<UserDetails> {
    return await this.userService.getUserDetailsByNickname(nickname);
  }

  /** Get user by id or nickname (query) */
  @Get('search/id-or-nickname')
  async getUserByIdOrNickname(
    @Query('id') id?: string,
    @Query('nickname') nickname?: string,
  ): Promise<PublicUser | null> {
    if (id) {
      const idNum = Number(id);
      if (!isNaN(idNum)) {
        return toPublicUser(await this.userService.getUserById(idNum));
      }
    }
    if (nickname) {
      return toPublicUser(await this.userService.getUserByNickname(nickname));
    }
    return null;
  }

  // ===== UPDATE =====

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
}
