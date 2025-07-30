import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { AuthProvider } from './auth.entity';
import { UpdatePasswordDto } from 'src/user/user.dto';
import { JwtService } from '@nestjs/jwt';

describe('AuthService - updatePassword()', () => {
  let authService: AuthService;
  let userService: Partial<UserService>;
  let authRepository: Partial<AuthRepository>;

  beforeEach(async () => {
    userService = {
      findWithPasswordById: jest.fn(),
      updatePassword: jest.fn(),
    };

    authRepository = {
      findAuthByUserId: jest.fn(),
    };

    const jwtService = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: AuthRepository, useValue: authRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  const validUser = { id: 1, password: 'hashed-old' };
  const validAuth = { provider: AuthProvider.LOCAL };

  const validDto: UpdatePasswordDto = {
    oldPassword: 'OldPass1!',
    newPassword: 'NewPass1!',
  };

  it('✅ 1. 정상적으로 비밀번호를 변경한다', async () => {
    (userService.findWithPasswordById as jest.Mock).mockResolvedValue(
      validUser,
    );
    (authRepository.findAuthByUserId as jest.Mock).mockResolvedValue(validAuth);
    (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
    (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashed-new');

    (userService.updatePassword as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await authService.updatePassword(1, validDto);

    expect(result).toEqual({ id: 1 });
    expect(bcrypt.compare).toBeCalledWith('OldPass1!', 'hashed-old');
    expect(bcrypt.hash).toBeCalledWith('NewPass1!', 10);
    expect(userService.updatePassword).toBeCalledWith(1, 'hashed-new');
  });

  it('❌ 2. 유저가 존재하지 않으면 예외 발생', async () => {
    (userService.findWithPasswordById as jest.Mock).mockResolvedValue(null);

    await expect(authService.updatePassword(1, validDto)).rejects.toThrow(
      'User with ID 1 not found.',
    );
  });

  it('❌ 3. provider가 LOCAL이 아니면 예외 발생', async () => {
    (userService.findWithPasswordById as jest.Mock).mockResolvedValue(
      validUser,
    );
    (authRepository.findAuthByUserId as jest.Mock).mockResolvedValue({
      provider: AuthProvider.GOOGLE,
    });

    await expect(authService.updatePassword(1, validDto)).rejects.toThrow(
      'Password update is only allowed for local accounts.',
    );
  });

  it('❌ 4. old password가 틀리면 예외 발생', async () => {
    (userService.findWithPasswordById as jest.Mock).mockResolvedValue(
      validUser,
    );
    (authRepository.findAuthByUserId as jest.Mock).mockResolvedValue(validAuth);
    (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);

    await expect(authService.updatePassword(1, validDto)).rejects.toThrow(
      'Old password is incorrect.',
    );
  });

  it('❌ 5. 대문자가 없으면 유효성 검사 실패 (형식 검증)', () => {
    const dto = { ...validDto, newPassword: 'password1!' };
    expect(dto.newPassword).not.toMatch(/[A-Z]/);
  });

  it('❌ 6. 소문자가 없으면 유효성 검사 실패 (형식 검증)', () => {
    const dto = { ...validDto, newPassword: 'PASSWORD1!' };
    expect(dto.newPassword).not.toMatch(/[a-z]/);
  });

  it('❌ 7. 숫자가 없으면 유효성 검사 실패 (형식 검증)', () => {
    const dto = { ...validDto, newPassword: 'Password!' };
    expect(dto.newPassword).not.toMatch(/\d/);
  });

  it('❌ 8. 특수문자가 없으면 유효성 검사 실패 (형식 검증)', () => {
    const dto = { ...validDto, newPassword: 'Password1' };
    expect(dto.newPassword).not.toMatch(/[!@#$%^&*(),.?":{}|<>]/);
  });

  it('❌ 9. 8자 미만이면 유효성 검사 실패 (형식 검증)', () => {
    const dto = { ...validDto, newPassword: 'P1!a' };
    expect(dto.newPassword.length).toBeLessThan(8);
  });
});
