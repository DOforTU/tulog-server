import { Injectable } from '@nestjs/common';
import { PostService } from 'src/post/post.service';
import { UserService } from 'src/user/user.service';
import { PostCardDto } from 'src/post/post.dto';
import { PublicUser } from 'src/user/user.dto';

// 검색시 게시글 public정보와 public유저정보를 반환하게 dto설정
export class SearchResponseDto {
  posts: PostCardDto[];
  users: PublicUser[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  // tag를 쿼리로 검색받으면 관련된 게시글과 유저정보가 나와야함
  // 쿼리와 연결 --> 쿼리로 관련된 게시글 가져오기 / 관련된 유저 가져오기
  // return은 posts와 users둘다 가져와서 프론트가 사용자에게 사용자 정보를 보여줄지 게시글 정보를 보여줄지 선택

  async searchByQuery(query: string): Promise<SearchResponseDto | null> {
    const posts = await this.postService.findPostsByQuery(query);

    // 닉네임으로 검색된 사용자들
    const users = await this.userService.findUserByQuery(query);

    // 게시글 작성자들도 추가
    const editors = await this.postService.findEditorsByQuery(query);

    // 중복 제거하여 합치기 (id 기준으로 중복 제거)
    const allUsers = [...users, ...editors];
    const uniqueUsers = allUsers.filter(
      (user, index, self) => index === self.findIndex((u) => u.id === user.id),
    );

    return { posts, users: uniqueUsers };
  }

  //  async searchPostsByKeyword(keyword: string): Promise<PostCardDto[]> {
  //    return await this.postService.findPostsByKeyword(keyword);
  //  }
}
