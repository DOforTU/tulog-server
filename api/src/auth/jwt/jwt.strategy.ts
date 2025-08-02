import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { Request } from 'express';
import { Strategy as JwtStrategy } from 'passport-jwt';

// Function to extract JWT token from cookies
const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }
  return token;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(JwtStrategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: cookieExtractor, // Extract token from cookies
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    type: string;
    iat: number;
    exp: number;
  }) {
    // Allow access tokens only
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userService.findBySub(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
