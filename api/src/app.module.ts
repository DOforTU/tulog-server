import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { Auth } from './auth/auth.entity';
import { FollowModule } from './follow/follow.module';
import { Follow } from './follow/follow.entity';
import { Team } from './team/team.entity';
import { UserBlcokModule } from './block/user-block.module';
import { UserBlock } from './block/user-block.entity';
import { TeamMember } from './team-member/team-member.entity';
import { TeamModule } from './team/team.module';
import { TeamMemberModule } from './team-member/team-member.module';
import { FileModule } from './file/file.module';
import { PendingUser } from './auth/pending-user.entity';
import { NoticeModule } from './notice/notice.module';
import { Notice } from './notice/notice.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*', '/auth*', '/users*'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        schema: configService.get('DB_SCHEMA'),
        entities: [
          User,
          Auth,
          Follow,
          Team,
          UserBlock,
          TeamMember,
          PendingUser,
          Notice,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    FileModule,
    UserModule,
    AuthModule,
    FollowModule,
    TeamModule,
    UserBlcokModule,
    TeamMemberModule,
    NoticeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 모든 라우트에 미들웨어 적용
    consumer.apply(SecurityMiddleware, LoggingMiddleware).forRoutes('*');
  }
}
