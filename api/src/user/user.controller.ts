import {
  Controller,
  Get,
  Post,
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
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 사용자 관리 컨트롤러
 * - 사용자 CRUD API 제공
 * - JWT 인증 보호
 * - Soft Delete 지원
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 모든 활성 사용자 조회 */
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  /** 현재 로그인한 사용자 정보 조회 */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Request() req: { user: User }): User {
    return req.user;
  }

  /** 삭제된 사용자 목록 조회 */
  @Get('deleted')
  async findDeleted(): Promise<User[]> {
    return this.userService.getDeletedUsers();
  }

  /** 활성 사용자 수 조회 */
  @Get('count')
  async getCount(): Promise<{ count: number }> {
    const count = await this.userService.getUserCount();
    return { count };
  }

  /** ID로 사용자 조회 */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  /** 새 사용자 생성 */
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  /** 사용자 정보 업데이트 */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  /** 사용자 소프트 삭제 (JWT 인증 필요) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }

  /** 사용자 영구 삭제 (JWT 인증 필요) */
  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard)
  async hardRemove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.hardDeleteUser(id);
  }

  /** 삭제된 사용자 복구 */
  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.restoreUser(id);
  }
}

// TODO: 사용자 검색 API 추가 (이름, 이메일, 닉네임으로 검색)
// TODO: 페이지네이션 API 추가
// TODO: 사용자 프로필 이미지 업로드 API 추가
// TODO: 비밀번호 변경 API 추가
// TODO: 계정 활성화/비활성화 API 추가
// TODO: 관리자 권한 확인 미들웨어 추가
