import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtAuthStrategy } from './jwt/jwt.strategy';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './auth.entity';
import { AuthRepository } from './auth.repository';
import { PendingUser } from './pending-user.entity';
import { PendingUserRepository } from './pending-user.repository';

@Module({
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([Auth, PendingUser]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    PendingUserRepository,
    GoogleStrategy,
    JwtAuthStrategy,
  ],
  exports: [AuthService, AuthRepository, PendingUserRepository],
})
export class AuthModule {}
