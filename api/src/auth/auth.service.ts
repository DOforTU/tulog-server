import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

/** Google OAuth 사용자 정보 인터페이스 */
export interface GoogleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

/** 인증 결과 인터페이스 */
export interface AuthResult {
  accessToken: string;
  user: User;
}

/**
 * 인증 서비스
 * - Google OAuth 사용자 검증 및 처리
 * - JWT 토큰 생성
 * - 사용자 계정 연동 및 생성
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /** Google OAuth 사용자 검증 및 로그인 처리 */
  async validateGoogleUser(googleUser: GoogleUser): Promise<AuthResult> {
    const { id, email, firstName, lastName, picture } = googleUser;

    console.log('🔍 AuthService - validateGoogleUser 호출됨:', {
      id,
      email,
      firstName,
      lastName,
    });

    // 이 Google ID로 사용자가 존재하는지 확인 (활성 사용자만)
    let user = await this.userService.findByGoogleId(id);

    console.log('🔍 AuthService - findByGoogleId 결과:', user?.email || '없음');

    if (!user) {
      // 이 이메일로 활성 사용자가 존재하는지 확인 (다른 방법으로 가입했을 수 있음)
      const existingActiveUser = await this.userService.findByEmail(email);

      if (existingActiveUser) {
        // 기존 활성 사용자에 Google 계정 연동
        user = await this.userService.linkGoogleAccount(existingActiveUser.id, {
          googleId: id,
          profilePicture: picture,
        });
      } else {
        // 삭제된 사용자를 포함하여 이메일로 사용자 확인
        const existingUserIncludingDeleted =
          await this.userService.findByEmailIncludingDeleted(email);

        if (
          existingUserIncludingDeleted &&
          existingUserIncludingDeleted.isDeleted
        ) {
          // 삭제된 사용자가 있으면 복구하고 새 Google 정보로 업데이트
          user = await this.userService.restoreUser(
            existingUserIncludingDeleted.id,
          );
          user = await this.userService.linkGoogleAccount(user.id, {
            googleId: id,
            profilePicture: picture,
          });
          // 현재 Google 정보로 사용자명 업데이트
          user = await this.userService.updateUser(user.id, {
            username: `${firstName} ${lastName}`.trim(),
            nickname: email.split('@')[0],
          });
        } else {
          // Google 계정으로 새 사용자 생성
          user = await this.userService.createGoogleUser({
            googleId: id,
            email,
            username: `${firstName} ${lastName}`.trim(), // 실제 이름을 username에
            nickname: email.split('@')[0], // 이메일 앞부분을 nickname에
            profilePicture: picture,
          });
        }
      }
    }

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }
}

// TODO: 리프레시 토큰 기능 구현
// TODO: 토큰 만료 시간 관리 최적화
// TODO: 다중 기기 로그인 세션 관리
// TODO: 소셜 로그인 제공자 확장
// TODO: 계정 연동 해제 기능 추가
