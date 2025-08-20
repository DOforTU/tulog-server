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
import { Post } from './post/post.entity';
import { Editor } from './editor/editor.entity';
import { PostLike } from './post-like/post-like.entity';
import { Comment } from './comment/comment.entity';
import { PostHide } from './post-hide/post-hide.entity';
import { Bookmark } from './bookmark/bookmark.entity';
import { PostModule } from './post/post.module';
import { EditorModule } from './editor/editor.module';
import { PostLikeModule } from './post-like/post-like.module';
import { CommentModule } from './comment/comment.module';
import { PostHideModule } from './post-hide/post-hide.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { TagModule } from './tag/tag.module';
import { PostTagModule } from './post-tag/post-tag.module';
import { Tag } from './tag/tag.entity';
import { PostTag } from './post-tag/post-tag.entity';
import { TeamFollowModule } from './team-follow/team-follow.module';
import { TeamFollow } from './team-follow/team-follow.entity';
import { CommentLikeController } from './comment-like/comment-like.controller';
import { CommentLikeService } from './comment-like/comment-like.service';
import { CommentLikeModule } from './comment-like/comment-like.module';
import { CommentLike } from './comment-like/comment-like.entity';
import { SearchModule } from './search/search.module';
import { Search } from './search/search.entity';
import { ReportModule } from './report/report.module';
import { Report } from './report/report.entity';

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
          Post,
          Editor,
          PostLike,
          Comment,
          CommentLike,
          PostHide,
          Bookmark,
          Tag,
          PostTag,
          TeamFollow,
          Search,
          Report,
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
    PostModule,
    EditorModule,
    PostLikeModule,
    CommentModule,
    PostHideModule,
    BookmarkModule,
    TagModule,
    PostTagModule,
    TeamFollowModule,
    CommentLikeModule,
    SearchModule,
    ReportModule,
  ],
  controllers: [AppController, CommentLikeController],
  providers: [AppService, CommentLikeService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 모든 라우트에 미들웨어 적용
    consumer.apply(SecurityMiddleware, LoggingMiddleware).forRoutes('*');
  }
}
