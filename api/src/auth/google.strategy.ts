import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

interface GoogleProfile {
  id: string;
  name: {
    givenName: string;
    familyName: string;
  };
  emails: Array<{
    value: string;
    verified: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<any> {
    console.log(
      '🔍 Google Strategy - 전체 프로필 객체:',
      JSON.stringify(profile, null, 2),
    );

    const { id, name, emails, photos } = profile;

    console.log('🔍 Google Strategy - 받은 프로필:', {
      id,
      email: emails[0]?.value,
      name: name?.givenName + ' ' + name?.familyName,
    });

    const googleUser = {
      id,
      email: emails[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos[0]?.value || '',
    };

    console.log('🔍 Google Strategy - 변환된 사용자:', googleUser);

    const result = await this.authService.validateGoogleUser(googleUser);

    console.log('🔍 Google Strategy - 최종 결과:', result.user);

    done(null, result);
  }
}
