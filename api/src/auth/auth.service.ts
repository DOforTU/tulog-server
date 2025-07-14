import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

export interface GoogleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

export interface AuthResult {
  accessToken: string;
  user: any;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser): Promise<AuthResult> {
    const { id, email, firstName, lastName, picture } = googleUser;

    // Check if user exists with this Google ID (only active users)
    let user = await this.userService.findByGoogleId(id);

    if (!user) {
      // Check if active user exists with this email (might be registered with different method)
      const existingActiveUser = await this.userService.findByEmail(email);

      if (existingActiveUser) {
        // Link Google account to existing active user
        user = await this.userService.linkGoogleAccount(existingActiveUser.id, {
          googleId: id,
          profilePicture: picture,
        });
      } else {
        // Check if any user (including deleted) exists with this email
        const existingUserIncludingDeleted =
          await this.userService.findByEmailIncludingDeleted(email);

        if (
          existingUserIncludingDeleted &&
          existingUserIncludingDeleted.isDeleted
        ) {
          // If deleted user exists, restore and update with new Google info
          user = await this.userService.restoreUser(
            existingUserIncludingDeleted.id,
          );
          user = await this.userService.linkGoogleAccount(user.id, {
            googleId: id,
            profilePicture: picture,
          });
          // Update username with current Google info
          user = await this.userService.updateUser(user.id, {
            username: `${firstName} ${lastName}`.trim(),
            nickname: email.split('@')[0],
          });
        } else {
          // Create new user with Google account
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

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }
}
